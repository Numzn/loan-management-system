import { saveFileToLocal, getFileFromLocal } from './localStorageHandler';
import { uploadFile, downloadFile, deleteFile } from './supabaseClient';
import { notifyDocumentUploaded } from './notificationHandler';

// Storage modes
export const STORAGE_MODE = {
  LOCAL: 'LOCAL',
  SUPABASE: 'SUPABASE'
};

// Current storage mode - can be changed at runtime
let currentMode = STORAGE_MODE.LOCAL;

export const setStorageMode = (mode) => {
  if (!Object.values(STORAGE_MODE).includes(mode)) {
    throw new Error('Invalid storage mode');
  }
  currentMode = mode;
};

// Upload file
export const uploadDocument = async (file, applicationId) => {
  try {
    let fileId;

    if (currentMode === STORAGE_MODE.LOCAL) {
      fileId = await saveFileToLocal(file);
    } else {
      const path = `applications/${applicationId}/${file.name}`;
      const result = await uploadFile('loan-documents', path, file);
      fileId = result.path;
    }

    // Notify about successful upload
    notifyDocumentUploaded(file.name, applicationId);

    return {
      fileId,
      fileName: file.name,
      storageMode: currentMode
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Download file
export const downloadDocument = async (fileId, storageMode = currentMode) => {
  try {
    if (storageMode === STORAGE_MODE.LOCAL) {
      return await getFileFromLocal(fileId);
    } else {
      return await downloadFile('loan-documents', fileId);
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};

// Delete file
export const deleteDocument = async (fileId, storageMode = currentMode) => {
  try {
    if (storageMode === STORAGE_MODE.LOCAL) {
      // Implementation for local storage deletion
      localStorage.removeItem(`file_${fileId}`);
      const filesMetadata = JSON.parse(localStorage.getItem('loanFiles') || '{}');
      delete filesMetadata[fileId];
      localStorage.setItem('loanFiles', JSON.stringify(filesMetadata));
    } else {
      await deleteFile('loan-documents', fileId);
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Migrate file from local to Supabase
export const migrateToSupabase = async (fileId, applicationId) => {
  try {
    // Get file from local storage
    const fileData = await getFileFromLocal(fileId);
    
    // Convert base64 to blob
    const response = await fetch(fileData.data);
    const blob = await response.blob();
    
    // Upload to Supabase
    const path = `applications/${applicationId}/${fileData.name}`;
    const result = await uploadFile('loan-documents', path, blob);
    
    // Delete from local storage
    await deleteDocument(fileId, STORAGE_MODE.LOCAL);
    
    return {
      fileId: result.path,
      fileName: fileData.name,
      storageMode: STORAGE_MODE.SUPABASE
    };
  } catch (error) {
    console.error('Error migrating file to Supabase:', error);
    throw error;
  }
}; 