import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';

const DatabaseSetup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const setupDatabase = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Enable extensions
      await supabase.rpc('extensions', {
        extensions: ['uuid-ossp']
      });

      // Create tables and set up RLS
      const { error: setupError } = await supabase.rpc('setup_schema', {
        schema_sql: `
          -- Enable Row Level Security
          ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

          -- Create profiles table
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            full_name TEXT,
            phone TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );

          -- Enable RLS on profiles
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

          -- Create loan_applications table
          CREATE TABLE IF NOT EXISTS public.loan_applications (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            loan_amount DECIMAL(12,2) NOT NULL,
            loan_purpose TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEW', 'APPROVED', 'REJECTED')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );

          -- Enable RLS on loan_applications
          ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

          -- Create loan_documents table
          CREATE TABLE IF NOT EXISTS public.loan_documents (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
            document_type TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );

          -- Enable RLS on loan_documents
          ALTER TABLE public.loan_documents ENABLE ROW LEVEL SECURITY;

          -- Create loan_status_history table
          CREATE TABLE IF NOT EXISTS public.loan_status_history (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
            status TEXT NOT NULL CHECK (status IN ('PENDING', 'REVIEW', 'APPROVED', 'REJECTED')),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );

          -- Enable RLS on loan_status_history
          ALTER TABLE public.loan_status_history ENABLE ROW LEVEL SECURITY;
        `
      });

      if (setupError) throw setupError;

      // Set up RLS policies
      const { error: policiesError } = await supabase.rpc('setup_policies', {
        policies_sql: `
          -- Profiles policies
          CREATE POLICY "Users can view own profile"
            ON public.profiles FOR SELECT
            USING (auth.uid() = id);

          CREATE POLICY "Users can update own profile"
            ON public.profiles FOR UPDATE
            USING (auth.uid() = id);

          -- Loan applications policies
          CREATE POLICY "Users can view own applications"
            ON public.loan_applications FOR SELECT
            USING (auth.uid() = user_id);

          CREATE POLICY "Users can create applications"
            ON public.loan_applications FOR INSERT
            WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update own pending applications"
            ON public.loan_applications FOR UPDATE
            USING (auth.uid() = user_id AND status = 'PENDING');

          -- Loan documents policies
          CREATE POLICY "Users can view own application documents"
            ON public.loan_documents FOR SELECT
            USING (EXISTS (
              SELECT 1 FROM public.loan_applications
              WHERE id = loan_application_id
              AND user_id = auth.uid()
            ));

          CREATE POLICY "Users can upload documents to own applications"
            ON public.loan_documents FOR INSERT
            WITH CHECK (EXISTS (
              SELECT 1 FROM public.loan_applications
              WHERE id = loan_application_id
              AND user_id = auth.uid()
            ));

          -- Status history policies
          CREATE POLICY "Users can view own application status history"
            ON public.loan_status_history FOR SELECT
            USING (EXISTS (
              SELECT 1 FROM public.loan_applications
              WHERE id = loan_application_id
              AND user_id = auth.uid()
            ));
        `
      });

      if (policiesError) throw policiesError;

      // Set up triggers
      const { error: triggersError } = await supabase.rpc('setup_triggers', {
        triggers_sql: `
          -- Trigger for updating profiles.updated_at
          CREATE OR REPLACE FUNCTION public.handle_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          CREATE TRIGGER profiles_updated_at
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();

          CREATE TRIGGER loan_applications_updated_at
            BEFORE UPDATE ON public.loan_applications
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();

          -- Create profile on user signup
          CREATE OR REPLACE FUNCTION public.handle_new_user()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO public.profiles (id, full_name, phone)
            VALUES (
              NEW.id,
              NEW.raw_user_meta_data->>'full_name',
              NEW.raw_user_meta_data->>'phone'
            );
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;

          CREATE OR REPLACE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `
      });

      if (triggersError) throw triggersError;

      setSuccess(true);
    } catch (err) {
      console.error('Database setup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Database Setup
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Database setup completed successfully!
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Button
        variant="contained"
          onClick={setupDatabase}
          disabled={loading}
        >
          {loading ? 'Setting up...' : 'Setup Database'}
      </Button>
        {loading && <CircularProgress size={24} />}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This will create all necessary tables and set up security policies.
      </Typography>
    </Paper>
  );
};

export default DatabaseSetup; 