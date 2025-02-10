import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const TABLES = {
  LOAN_APPLICATIONS: 'loan_applications',
  LOAN_DOCUMENTS: 'loan_documents',
  LOAN_STATUS_HISTORY: 'loan_status_history',
  PROFILES: 'profiles'
};

export const STORAGE = {
  LOAN_DOCUMENTS: 'loan-documents'
};

export const ALLOWED_FILE_TYPES = {
  'image/png': true,
  'image/jpeg': true,
  'application/pdf': true
};

// First, let's query the database to check the actual enum values
const getLoanStatusValues = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_loan_status_values');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching loan status values:', error);
    // Return default values as fallback
    return ['new', 'submitted', 'under_review', 'approved', 'rejected'];
  }
};

export const LOAN_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  DISBURSED: 'disbursed',
  REJECTED: 'rejected',
  CLOSED: 'closed'
};

// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Mock Supabase Client
class MockSupabaseClient {
  constructor() {
    this.auth = {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    };

    this.storage = {
      from: (bucket) => ({
        upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
        download: (path) => Promise.resolve({ data: new Blob(), error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
        remove: (paths) => Promise.resolve({ data: null, error: null })
      })
    };

    this.from = (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          single: () => Promise.resolve({ 
            data: {
              id: '123',
              status: 'submitted',
              loan_amount: 5000,
              created_at: new Date().toISOString(),
              loan_documents: []
            }, 
            error: null 
          }),
          order: (column, { ascending }) => Promise.resolve({ 
            data: [
              {
                id: '1',
                status: 'submitted',
                created_at: new Date().toISOString()
              }
            ], 
            error: null 
          })
        }),
        order: (column, { ascending }) => ({
          eq: (column, value) => Promise.resolve({ 
            data: [
              {
                id: '1',
                status: 'submitted',
                created_at: new Date().toISOString()
              }
            ], 
            error: null 
          })
        }),
        execute: () => Promise.resolve({ data: [], error: null })
      }),
      insert: (data) => Promise.resolve({ data, error: null }),
      update: (data) => ({
        eq: (column, value) => Promise.resolve({ data, error: null })
      }),
      delete: () => ({
        eq: (column, value) => Promise.resolve({ data: null, error: null })
      })
    });
  }
}

// Create mock client instance
const mockSupabase = new MockSupabaseClient();

// Mock storage initialization
const initializeStorage = async () => {
  // Mock successful initialization
  return Promise.resolve();
};

// Mock client getter
export const getSupabaseClient = () => {
  return mockSupabase;
};

export { mockSupabase, initializeStorage };

// Helper function to validate file type
export const isValidFileType = (file) => {
  return ALLOWED_FILE_TYPES[file.type] || false;
};

// Helper function to get file extension
export const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};

// Helper function to generate storage path
export const generateStoragePath = (applicationId, documentType, fileName) => {
  const extension = getFileExtension(fileName);
  return `${applicationId}/${documentType}_${Date.now()}.${extension}`;
};

// Helper function to handle database errors
export const handleDatabaseError = (error) => {
  console.error('Database error:', error);
  if (error.code === '42501') {
    return 'Permission denied. Please try again or contact support.';
  }
  if (error.code === '23505') {
    return 'A record with this information already exists.';
  }
  return error.message || 'An unexpected error occurred.';
};