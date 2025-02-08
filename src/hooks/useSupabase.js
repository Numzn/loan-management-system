import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import * as dbOps from '../utils/supabaseClient';

// Authentication hooks
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const session = supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};

// Profile hooks
export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await dbOps.getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [userId]);

  return { profile, loading, error, updateProfile };
};

// Loan application hooks
export const useLoanApplication = (applicationId) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const data = await dbOps.getLoanApplication(applicationId);
        setApplication(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  const updateApplication = useCallback(async (updates) => {
    try {
      const data = await dbOps.updateLoanApplication(applicationId, updates);
      setApplication(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [applicationId]);

  return { application, loading, error, updateApplication };
};

// Loan applications list hook
export const useLoanApplications = (filters = {}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbOps.searchLoanApplications(filters);
      setApplications(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return { applications, loading, error, refresh: loadApplications };
};

// Document upload hook
export const useDocumentUpload = (applicationId) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadDocument = useCallback(async (file, documentType) => {
    try {
      setUploading(true);
      setError(null);

      // Upload file to storage
      const path = `applications/${applicationId}/${documentType}/${file.name}`;
      const fileData = await dbOps.uploadFile('loan-documents', path, file);

      // Create document record
      const documentData = {
        loan_application_id: applicationId,
        document_type: documentType,
        file_path: path,
        file_name: file.name,
        uploaded_by: supabase.auth.user()?.id
      };

      const document = await dbOps.addDocument(documentData);
      return document;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [applicationId]);

  return { uploadDocument, uploading, error };
};

// Status history hook
export const useStatusHistory = (applicationId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('loan_status_history')
          .select('*')
          .eq('loan_application_id', applicationId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      loadHistory();
    }
  }, [applicationId]);

  const addStatusChange = useCallback(async (status, notes) => {
    try {
      const statusData = {
        loan_application_id: applicationId,
        status,
        notes,
        changed_by: supabase.auth.user()?.id
      };

      const newStatus = await dbOps.addStatusHistory(statusData);
      setHistory(prev => [newStatus, ...prev]);
      return newStatus;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [applicationId]);

  return { history, loading, error, addStatusChange };
};

// Real-time updates hook
export const useRealtimeUpdates = (table, filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let query = supabase
      .from(table)
      .select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    // Initial load
    query.then(({ data: initialData, error: initialError }) => {
      if (initialError) {
        setError(initialError);
      } else {
        setData(initialData);
      }
      setLoading(false);
    });

    // Subscribe to changes
    const subscription = supabase
      .from(table)
      .on('*', (payload) => {
        setData(current => {
          switch (payload.eventType) {
            case 'INSERT':
              return [...current, payload.new];
            case 'UPDATE':
              return current.map(item => 
                item.id === payload.new.id ? payload.new : item
              );
            case 'DELETE':
              return current.filter(item => item.id !== payload.old.id);
            default:
              return current;
          }
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, JSON.stringify(filters)]);

  return { data, loading, error };
}; 