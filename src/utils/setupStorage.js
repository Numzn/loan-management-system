import { supabase } from '../config/supabaseClient';

export const setupStorage = async () => {
  try {
    // Create the loan-documents bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) throw listError;

    const loanDocumentsBucket = buckets?.find(b => b.name === 'loan-documents');
    
    if (!loanDocumentsBucket) {
      // Create the bucket
      const { error: createError } = await supabase
        .storage
        .createBucket('loan-documents', {
          public: false,
          allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
          fileSizeLimit: 5242880, // 5MB
        });

      if (createError) throw createError;

      // Set up bucket policies
      const { error: policyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: 'loan-documents',
        policy: `
          CREATE POLICY "Allow authenticated uploads" 
          ON storage.objects 
          FOR INSERT 
          TO authenticated 
          WITH CHECK (bucket_id = 'loan-documents');

          CREATE POLICY "Allow management access" 
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

          CREATE POLICY "Allow users to access their own documents" 
          ON storage.objects 
          FOR SELECT 
          TO authenticated 
          USING (
            bucket_id = 'loan-documents'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );
        `
      });

      if (policyError) throw policyError;

      console.log('Storage bucket and policies created successfully');
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting up storage:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}; 