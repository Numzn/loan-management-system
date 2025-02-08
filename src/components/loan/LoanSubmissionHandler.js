import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { toast } from 'react-toastify';

export const submitLoanApplication = async (applicationData) => {
  try {
    // First, upload all documents to Firebase Storage
    const uploadedDocuments = {};
    for (const [docName, file] of Object.entries(applicationData.documents)) {
      const storageRef = ref(storage, `loan-documents/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      uploadedDocuments[docName] = {
        name: file.name,
        url: downloadURL,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    }

    // Replace the File objects with the uploaded document metadata
    const applicationDataToSave = {
      ...applicationData,
      documents: uploadedDocuments,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notifications: [{
        type: 'new_application',
        title: 'New Loan Application',
        message: 'A new loan application has been submitted',
        timestamp: serverTimestamp(),
        isRead: false,
        priority: 'high'
      }],
      history: [{
        action: 'application_submitted',
        timestamp: serverTimestamp(),
        details: 'Application submitted for review'
      }]
    };

    // Add application to Firestore
    const docRef = await addDoc(collection(db, 'loanApplications'), applicationDataToSave);

    // Add notification to separate notifications collection for real-time tracking
    await addDoc(collection(db, 'notifications'), {
      type: 'new_application',
      title: 'New Loan Application',
      message: 'A new loan application has been submitted',
      timestamp: serverTimestamp(),
      isRead: false,
      priority: 'high',
      applicationId: docRef.id,
      recipientRole: 'loan_officer'
    });

    // Show success message to client
    toast.success('Loan application submitted successfully!');

    return {
      success: true,
      applicationId: docRef.id,
      message: 'Application submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting loan application:', error);
    toast.error('Failed to submit loan application. Please try again.');
    
    throw new Error('Failed to submit loan application');
  }
};

export const updateApplicationStatus = async (applicationId, status, comments = '') => {
  try {
    const docRef = doc(db, 'loanApplications', applicationId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
      'history': arrayUnion({
        action: `status_updated_to_${status}`,
        timestamp: serverTimestamp(),
        comments,
      })
    });

    return {
      success: true,
      message: 'Application status updated successfully'
    };
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
}; 