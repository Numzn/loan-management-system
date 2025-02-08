import { v4 as uuidv4 } from 'uuid';

// Convert file to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Save file to local storage
export const saveFileToLocal = async (file) => {
  try {
    const fileId = uuidv4();
    const base64String = await fileToBase64(file);
    const fileData = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64String,
      timestamp: Date.now()
    };

    // Store file metadata in localStorage
    const filesMetadata = JSON.parse(localStorage.getItem('loanFiles') || '{}');
    filesMetadata[fileId] = {
      name: file.name,
      type: file.type,
      size: file.size,
      timestamp: Date.now()
    };
    localStorage.setItem('loanFiles', JSON.stringify(filesMetadata));

    // Store actual file data separately
    localStorage.setItem(`file_${fileId}`, JSON.stringify(fileData));
    
    return fileId;
  } catch (error) {
    console.error('Error saving file to local storage:', error);
    throw error;
  }
};

// Retrieve file from local storage
export const getFileFromLocal = (fileId) => {
  try {
    const fileData = JSON.parse(localStorage.getItem(`file_${fileId}`));
    return fileData;
  } catch (error) {
    console.error('Error retrieving file from local storage:', error);
    throw error;
  }
};

// Clean up old files (older than 24 hours)
export const cleanupOldFiles = () => {
  try {
    const filesMetadata = JSON.parse(localStorage.getItem('loanFiles') || '{}');
    const now = Date.now();
    const DAY_IN_MS = 24 * 60 * 60 * 1000;

    Object.entries(filesMetadata).forEach(([fileId, metadata]) => {
      if (now - metadata.timestamp > DAY_IN_MS) {
        localStorage.removeItem(`file_${fileId}`);
        delete filesMetadata[fileId];
      }
    });

    localStorage.setItem('loanFiles', JSON.stringify(filesMetadata));
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

// Get total storage usage
export const getStorageUsage = () => {
  try {
    const filesMetadata = JSON.parse(localStorage.getItem('loanFiles') || '{}');
    return Object.values(filesMetadata).reduce((total, file) => total + file.size, 0);
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return 0;
  }
}; 