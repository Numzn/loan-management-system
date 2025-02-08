-- Create enum types
CREATE TYPE user_role AS ENUM ('client', 'loan_officer', 'manager', 'director', 'finance_officer');
CREATE TYPE loan_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'disbursed', 'closed');
CREATE TYPE document_type AS ENUM ('id_proof', 'income_proof', 'address_proof', 'bank_statement', 'other');

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'client',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loan_applications table
CREATE TABLE loan_applications (
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

-- Create loan_documents table
CREATE TABLE loan_documents (
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

-- Create loan_status_history table
CREATE TABLE loan_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    status loan_status NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE loan_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_loan_applications_user ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_documents_application ON loan_documents(loan_application_id);
CREATE INDEX idx_status_history_application ON loan_status_history(loan_application_id);
CREATE INDEX idx_loan_comments_application ON loan_comments(loan_application_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Loan applications policies
CREATE POLICY "Clients can view their own applications"
    ON loan_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all applications"
    ON loan_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('loan_officer', 'manager', 'director', 'finance_officer')
        )
    );

-- Documents policies
CREATE POLICY "Users can view their own documents"
    ON loan_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM loan_applications
            WHERE id = loan_application_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all documents"
    ON loan_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('loan_officer', 'manager', 'director', 'finance_officer')
        )
    );

-- First, delete any existing test users and their profiles
DELETE FROM auth.users WHERE email IN (
  'loan.officer@example.com',
  'manager@example.com',
  'director@example.com',
  'finance.officer@example.com'
);

-- Create the user_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('loan_officer', 'manager', 'director', 'finance_officer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to create a user with proper auth setup
CREATE OR REPLACE FUNCTION create_management_user(
  email text,
  password text,
  role text
) RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert into auth.users with proper password hashing
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf', 10)),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    format('{"role":"%s"}', role)::jsonb,
    NOW(),
    NOW(),
    encode(gen_random_bytes(32), 'hex'),
    NULL,
    NULL,
    encode(gen_random_bytes(32), 'hex')
  ) RETURNING id INTO user_id;

  -- Create profile for the user
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    email,
    split_part(email, '@', 1),
    role::user_role,
    NOW(),
    NOW()
  );

  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Create test users
SELECT create_management_user('loan.officer@example.com', 'Test123!', 'loan_officer');
SELECT create_management_user('manager@example.com', 'Test123!', 'manager');
SELECT create_management_user('director@example.com', 'Test123!', 'director');
SELECT create_management_user('finance.officer@example.com', 'Test123!', 'finance_officer');

-- Drop the function as it's no longer needed
DROP FUNCTION create_management_user; 