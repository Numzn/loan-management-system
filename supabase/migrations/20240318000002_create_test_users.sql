-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- First, let's delete existing users and their profiles (in correct order)
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'loan.officer@example.com',
    'manager@example.com',
    'director@example.com',
    'finance@example.com'
  )
);

DELETE FROM profiles WHERE email IN (
  'loan.officer@example.com',
  'manager@example.com',
  'director@example.com',
  'finance@example.com'
);

DELETE FROM auth.users WHERE email IN (
  'loan.officer@example.com',
  'manager@example.com',
  'director@example.com',
  'finance@example.com'
);

-- Create user_role enum type if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'loan_officer',
    'manager',
    'director',
    'finance_officer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to create users with profiles
CREATE OR REPLACE FUNCTION create_user_with_profile(
  email TEXT,
  password TEXT,
  role user_role,
  full_name TEXT
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create user in auth.users with minimum required fields
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_current,
    email_change_token_new,
    aud,
    role,
    confirmed_at
  )
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    email,
    crypt(password, gen_salt('bf', 10)),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    jsonb_build_object(
      'full_name', full_name
    ),
    false,
    now(),
    now(),
    null,
    null,
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    'authenticated',
    'authenticated',
    now()  -- Set confirmed_at to ensure the account is confirmed
  )
  RETURNING id INTO new_user_id;

  -- Create profile in profiles table
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    email,
    full_name,
    role,
    now(),
    now()
  );

  -- Update auth.users identities
  UPDATE auth.users
  SET identities = jsonb_build_array(
    jsonb_build_object(
      'id', id,
      'user_id', id,
      'identity_data', jsonb_build_object(
        'sub', id,
        'email', email
      ),
      'provider', 'email',
      'last_sign_in_at', now(),
      'created_at', now(),
      'updated_at', now()
    )
  )
  WHERE id = new_user_id;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users with a simpler password
DO $$ 
DECLARE
  user_id UUID;
BEGIN
  -- Loan Officer
  SELECT create_user_with_profile(
    'loan.officer@example.com',
    'Test123!',
    'loan_officer'::user_role,
    'John Officer'
  ) INTO user_id;
  
  -- Manager
  SELECT create_user_with_profile(
    'manager@example.com',
    'Test123!',
    'manager'::user_role,
    'Sarah Manager'
  ) INTO user_id;
  
  -- Director
  SELECT create_user_with_profile(
    'director@example.com',
    'Test123!',
    'director'::user_role,
    'David Director'
  ) INTO user_id;
  
  -- Finance Officer
  SELECT create_user_with_profile(
    'finance@example.com',
    'Test123!',
    'finance_officer'::user_role,
    'Mary Finance'
  ) INTO user_id;
END $$;

-- Drop the function after use
DROP FUNCTION create_user_with_profile; 