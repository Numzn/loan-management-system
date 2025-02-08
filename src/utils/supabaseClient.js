import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfvizjsuuwapylilchli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmdml6anN1dXdhcHlsaWxjaGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjc1ODEyMCwiZXhwIjoyMDUyMzM0MTIwfQ.uvxX-fUtWdEknXQPd8MHKpTihH854VXSFOykteNsypw';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  throw new Error('Missing Supabase configuration');
}

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Test connection function with retries
export const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting connection (attempt ${i + 1}/${retries})...`);
      
      // Try to query each required table
      const tables = ['profiles', 'loan_applications', 'loan_documents', 'loan_status_history'];
      const results = await Promise.all(
        tables.map(async table => {
      const { data, error } = await supabase
            .from(table)
            .select('id')
            .limit(1);
          return { 
            table, 
            exists: !error || !error.message.includes('does not exist'),
            error: error?.message
          };
        })
      );

      // Check if all tables exist
      const missingTables = results.filter(r => !r.exists).map(r => r.table);
      
      if (missingTables.length > 0) {
        console.warn('Missing tables:', missingTables);
        return {
          success: false,
          error: `Tables not found: ${missingTables.join(', ')}`,
          details: {
            missingTables,
            errors: results.filter(r => r.error).map(r => `${r.table}: ${r.error}`),
            action: 'Please verify that the database setup SQL was executed successfully'
          }
        };
      }

      // Check storage bucket
      const { error: storageError } = await supabase.storage.getBucket('loan-documents');
      if (storageError) {
        return {
          success: false,
          error: 'Storage bucket not found',
          details: {
            error: storageError.message,
            action: 'Create a storage bucket named "loan-documents" in the Supabase dashboard'
          }
        };
      }

      return { 
        success: true, 
        message: 'Connected successfully',
        details: {
          tables: tables,
          storage: 'loan-documents bucket found'
        }
      };
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        return { 
          success: false, 
          error: error.message,
          details: {
            errorCode: error.code,
            hint: error.hint || 'Check your Supabase configuration and network connection'
          }
        };
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Database setup function
export const setupDatabase = async () => {
  try {
    // Check if tables exist by trying to query them
    const tables = ['profiles', 'loan_applications', 'loan_documents', 'loan_status_history'];
    const results = await Promise.all(
      tables.map(async table => {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        return { table, exists: !error || !error.message.includes('does not exist') };
      })
    );

    const missingTables = results.filter(r => !r.exists).map(r => r.table);
    
    if (missingTables.length > 0) {
      console.warn('Missing tables:', missingTables);
      return { 
        success: false, 
        error: `Database not set up. Missing tables: ${missingTables.join(', ')}. Please run the database setup SQL in the Supabase dashboard.`,
        details: {
          missingTables,
          action: 'Run the SQL setup script in the Supabase dashboard SQL editor'
        }
      };
    }

    // Check if storage bucket exists
    const { error: storageError } = await supabase
      .storage
      .getBucket('loan-documents');

    if (storageError) {
      console.warn('Storage bucket not found:', storageError);
      return { 
        success: false, 
        error: 'Storage bucket "loan-documents" not found. Please create it in the Supabase dashboard.',
        details: {
          action: 'Create a storage bucket named "loan-documents" in the Supabase dashboard'
        }
      };
    }

    return { 
      success: true, 
      message: 'Database setup verified successfully',
      details: {
        tablesFound: tables.length,
        storageReady: true
      }
    };
  } catch (error) {
    console.error('Database verification failed:', error);
    return { 
      success: false, 
      error: error.message,
      details: {
        errorCode: error.code,
        hint: error.hint || 'Check Supabase dashboard for more details'
      }
    };
  }
};

// File storage helpers
export const uploadFile = async (bucket, path, file) => {
  try {
    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported. Supported types: JPEG, PNG, GIF, WEBP, PDF`);
    }

    // Check file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_SIZE) {
      throw new Error(`File size exceeds 5MB limit`);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Download file
export const downloadFile = async (bucket, path) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// List files in a bucket
export const listFiles = async (bucket, path = '') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (bucket, path) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Database Operations

// User Profile Operations
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Loan Application Operations
export const createLoanApplication = async (applicationData) => {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating loan application:', error);
    throw error;
  }
};

export const updateLoanApplication = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating loan application:', error);
    throw error;
  }
};

export const getLoanApplication = async (id) => {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select(`
        *,
        documents:loan_documents(*),
        status_history:loan_status_history(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching loan application:', error);
    throw error;
  }
};

export const searchLoanApplications = async (filters = {}) => {
  try {
    let query = supabase
      .from('loan_applications')
      .select(`
        *,
        documents:loan_documents(id, document_type, file_path),
        status_history:loan_status_history(status, created_at)
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.fromDate) {
      query = query.gte('created_at', filters.fromDate);
    }
    if (filters.toDate) {
      query = query.lte('created_at', filters.toDate);
    }
    if (filters.search) {
      query = query.or(`applicant_name.ilike.%${filters.search}%,application_id.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching loan applications:', error);
    throw error;
  }
};

// Document Operations
export const addDocument = async (documentData) => {
  try {
    const { data, error } = await supabase
      .from('loan_documents')
      .insert([documentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

// Status History Operations
export const addStatusHistory = async (statusData) => {
  try {
    const { data, error } = await supabase
      .from('loan_status_history')
      .insert([statusData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding status history:', error);
    throw error;
  }
}; 