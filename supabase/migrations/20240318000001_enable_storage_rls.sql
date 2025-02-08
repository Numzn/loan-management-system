-- Enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the loan-documents bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'loan-documents');

CREATE POLICY "Allow users to access their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'loan-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow management to access all documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'loan-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('loan_officer', 'manager', 'director', 'finance_officer')
  )
);

-- Create the loan-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'loan-documents',
  'loan-documents',
  false,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types; 