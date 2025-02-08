import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loanApplicationService = {
  // Get application details
  getApplication: async (applicationId) => {
    try {
      const response = await api.get(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch application details');
    }
  },

  // Update application status
  updateStatus: async (applicationId, status) => {
    try {
      const response = await api.patch(`/applications/${applicationId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update application status');
    }
  },

  // Upload document
  uploadDocument: async (applicationId, documentType, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await api.post(
        `/applications/${applicationId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // You can use this to update upload progress
            return percentCompleted;
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to upload document');
    }
  },

  // Delete document
  deleteDocument: async (applicationId, documentId) => {
    try {
      await api.delete(`/applications/${applicationId}/documents/${documentId}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete document');
    }
  },

  // Get notifications
  getNotifications: async (applicationId) => {
    try {
      const response = await api.get(`/applications/${applicationId}/notifications`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (applicationId, notificationId) => {
    try {
      const response = await api.patch(
        `/applications/${applicationId}/notifications/${notificationId}`,
        { read: true }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Submit additional information
  submitAdditionalInfo: async (applicationId, data) => {
    try {
      const response = await api.post(`/applications/${applicationId}/additional-info`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to submit additional information');
    }
  },

  // Request support
  requestSupport: async (applicationId, message) => {
    try {
      const response = await api.post(`/applications/${applicationId}/support`, { message });
      return response.data;
    } catch (error) {
      throw new Error('Failed to submit support request');
    }
  },
};

export default loanApplicationService; 