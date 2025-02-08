import { supabase } from './supabaseClient';

export const setupDatabase = async () => {
  try {
    // Create enum types
    await supabase.rpc('setup_enums', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('client', 'loan_officer', 'manager', 'director', 'finance_officer');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
            CREATE TYPE loan_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'disbursed', 'closed');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
            CREATE TYPE document_type AS ENUM ('id_proof', 'income_proof', 'address_proof', 'bank_statement', 'other');
          END IF;
        END
        $$;
      `
    });

    // Create profiles table
    await supabase.rpc('create_profiles_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          role user_role NOT NULL DEFAULT 'client',
          phone TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    // Create loan_applications table
    await supabase.rpc('create_loan_applications_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS loan_applications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          application_id TEXT UNIQUE NOT NULL,
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          applicant_name TEXT NOT NULL,
          loan_amount DECIMAL NOT NULL,
          loan_purpose TEXT NOT NULL,
          status loan_status DEFAULT 'draft',
          monthly_income DECIMAL,
          employment_type TEXT,
          employer_name TEXT,
          credit_score INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          submitted_at TIMESTAMPTZ,
          approved_at TIMESTAMPTZ,
          disbursed_at TIMESTAMPTZ,
          closed_at TIMESTAMPTZ
        );
      `
    });

    // Create loan_documents table
    await supabase.rpc('create_loan_documents_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS loan_documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
          document_type document_type NOT NULL,
          file_path TEXT NOT NULL,
          file_name TEXT NOT NULL,
          uploaded_by UUID REFERENCES auth.users(id),
          verified BOOLEAN DEFAULT FALSE,
          verified_by UUID REFERENCES auth.users(id),
          verified_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    // Create loan_status_history table
    await supabase.rpc('create_loan_status_history_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS loan_status_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
          status loan_status NOT NULL,
          notes TEXT,
          changed_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    // Create storage bucket
    await supabase.rpc('create_storage_bucket', {
      sql: `
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('loan-documents', 'loan-documents', false)
        ON CONFLICT (id) DO NOTHING;
      `
    });

    // Create version function
    await supabase.rpc('create_version_function', {
      sql: `
        CREATE OR REPLACE FUNCTION version()
        RETURNS text
        LANGUAGE SQL
        AS $$
          SELECT version();
        $$;
      `
    });

    // Create RLS policies
    await supabase.rpc('setup_rls_policies', {
      sql: `
        -- Enable RLS
        ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS loan_applications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS loan_documents ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS loan_status_history ENABLE ROW LEVEL SECURITY;

        -- Profiles policies
        CREATE POLICY IF NOT EXISTS "Users can view their own profile"
          ON profiles FOR SELECT
          USING (auth.uid() = id);

        CREATE POLICY IF NOT EXISTS "Users can update their own profile"
          ON profiles FOR UPDATE
          USING (auth.uid() = id);

        -- Loan applications policies
        CREATE POLICY IF NOT EXISTS "Clients can view their own applications"
          ON loan_applications FOR SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Staff can view all applications"
          ON loan_applications FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid()
              AND role IN ('loan_officer', 'manager', 'director', 'finance_officer')
            )
          );
      `
    });

    return { success: true, message: 'Database setup completed successfully' };
  } catch (error) {
    console.error('Database setup error:', error);
    return { success: false, message: error.message };
  }
}; 