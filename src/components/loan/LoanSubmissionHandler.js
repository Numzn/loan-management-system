import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-toastify';

// File validation helper
const validateFile = (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = {
    'id_document': ['image/jpeg', 'image/png', 'application/pdf'],
    'proof_of_income': ['image/jpeg', 'image/png', 'application/pdf'],
    'bank_statements': ['application/pdf'],
    'profile_photo': ['image/jpeg', 'image/png'],
    'other': ['image/jpeg', 'image/png', 'application/pdf']
  };

  if (!file) return 'No file provided';
  if (file.size > MAX_FILE_SIZE) return 'File size exceeds 5MB limit';
  
  const fileType = file.type;
  const validTypes = Object.values(ALLOWED_TYPES).flat();
  if (!validTypes.includes(fileType)) return 'Invalid file type';
  
  return null;
};

// Add NRC validation helper function
const formatNRC = (nrc) => {
  if (!nrc) return '000000/00/1'; // Default value if no NRC provided
  
  try {
    // Remove all spaces and special characters except numbers and forward slashes
    let cleanNRC = nrc.toString().replace(/[^0-9/]/g, '');
    
    // If no slashes, try to format it
    if (!cleanNRC.includes('/')) {
      if (cleanNRC.length >= 9) {
        cleanNRC = `${cleanNRC.slice(0,6)}/${cleanNRC.slice(6,8)}/${cleanNRC.slice(8,9)}`;
      }
    }
    
    // Add leading zeros if needed for each section
    const parts = cleanNRC.split('/');
    if (parts.length === 3) {
      const [first, second, third] = parts;
      cleanNRC = `${first.padStart(6, '0')}/${second.padStart(2, '0')}/${third}`;
    }
    
    // Final check for the correct format
    const nrcPattern = /^(\d{6})\/(\d{2})\/(\d{1})$/;
    if (!nrcPattern.test(cleanNRC)) {
      console.warn('NRC Format Warning:', { original: nrc, cleaned: cleanNRC });
      return '000000/00/1'; // Fallback to default if format is still invalid
    }
    
    return cleanNRC;
  } catch (error) {
    console.error('NRC Format Error:', error);
    return '000000/00/1'; // Return default value on error
  }
};

export const submitLoanApplication = async (applicationData) => {
  try {
    console.log('Submitting application data:', applicationData);

    // 1. Create or get user account
    const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
      email: applicationData.personalDetails?.email,
      options: {
        data: {
          phone: applicationData.personalDetails?.phoneNumber,
          full_name: `${applicationData.personalDetails?.firstName} ${applicationData.personalDetails?.lastName}`
        }
      }
    });

    if (authError) throw authError;

    // 2. Create loan application record
    const applicationInsert = {
      application_id: `LOAN-${Date.now()}`,
      user_id: authData.user?.id || '00000000-0000-0000-0000-000000000000',
      created_by: authData.user?.id || '00000000-0000-0000-0000-000000000000',
      
      // Loan Details
      loan_type: applicationData.loanType || '',
      loan_amount: parseFloat(applicationData.amount || 0),
      loan_duration: parseInt(applicationData.duration || 0),
      loan_purpose: 'Personal Use',
      interest_rate: parseFloat(applicationData.interestRate || 0),
      monthly_payment: parseFloat(applicationData.calculatedResults?.monthlyPayment || 0),
      total_repayment: parseFloat(applicationData.calculatedResults?.totalRepayment || 0),
      duration_months: parseInt(applicationData.duration || 0),
      
      // Personal Details
      first_name: applicationData.personalDetails?.firstName || '',
      last_name: applicationData.personalDetails?.lastName || '',
      gender: applicationData.personalDetails?.gender || '',
      date_of_birth: applicationData.personalDetails?.dob || null,
      nrc_number: '000000/00/1', // Default NRC
      id_number: '000000/00/1', // Default ID
      phone_number: applicationData.personalDetails?.phoneNumber || '',
      email: applicationData.personalDetails?.email || '',
      physical_address: applicationData.personalDetails?.address || '',
      address: applicationData.personalDetails?.address || '',
      
      // Employment & Banking Details
      employment_type: applicationData.loanSpecificDetails?.employmentType || '',
      employer_name: applicationData.loanSpecificDetails?.employerName || '',
      monthly_income: parseFloat(applicationData.loanSpecificDetails?.monthlyIncome || 0),
      bank_name: applicationData.loanSpecificDetails?.bankName || '',
      account_number: applicationData.loanSpecificDetails?.accountNumber || '',
      bank_account: applicationData.loanSpecificDetails?.accountNumber || '',
      bank_branch: applicationData.loanSpecificDetails?.bankBranch || '',
      
      // Next of Kin
      next_of_kin_name: applicationData.loanSpecificDetails?.nextOfKinName || '',
      next_of_kin_phone: applicationData.loanSpecificDetails?.nextOfKinPhone || '',
      next_of_kin_relation: applicationData.loanSpecificDetails?.nextOfKinRelation || '',
      
      // Status and Timestamps
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString()
    };

    const { data: application, error: applicationError } = await supabase
      .from('loan_applications')
      .insert([applicationInsert])
      .select('*')  // Select all fields for dashboard
      .single();

    if (applicationError) throw applicationError;

    // Send success email with magic link
    await sendApplicationConfirmationEmail(
      applicationData.personalDetails?.email,
      application.application_id
    );

    return {
      success: true,
      applicationData: application, // Return full application data for dashboard
      message: 'Application submitted successfully. Please check your email for the confirmation link.'
    };

  } catch (error) {
    console.error('Error submitting loan application:', error);
    toast.error(error.message || 'Failed to submit loan application');
    throw error;
  }
};

const sendApplicationConfirmationEmail = async (email, applicationId) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/client/dashboard?application=${applicationId}`
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw here - we want the application to succeed even if email fails
  }
};

// Separate function to handle document upload
const handleDocumentUpload = async (applicationId, documents) => {
  try {
    for (const [docType, file] of Object.entries(documents)) {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(`${docType}: ${validationError}`);
        continue;
      }

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${applicationId}/${timestamp}-${docType}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('loan-documents')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Create document record
      const { error: docError } = await supabase
        .from('loan_documents')
        .insert({
          loan_application_id: applicationId,
          document_type: docType,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        });

      if (docError) throw docError;
    }
  } catch (error) {
    console.error('Error handling documents:', error);
    throw error;
  }
};

// Helper function to update application status
export const updateApplicationStatus = async (applicationId, newStatus, notes = '') => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Get current status
    const { data: currentApp, error: fetchError } = await supabase
      .from('loan_applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (fetchError) throw fetchError;

    // Update application status
    const { error: updateError } = await supabase
      .from('loan_applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) throw updateError;

    // Add status history record
    const { error: historyError } = await supabase
      .from('loan_status_history')
      .insert([{
        loan_application_id: applicationId,
        previous_status: currentApp.status,
        new_status: newStatus,
        changed_by: user.id,
        notes
      }]);

    if (historyError) throw historyError;

    return {
      success: true,
      message: 'Application status updated successfully'
    };

  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}; 