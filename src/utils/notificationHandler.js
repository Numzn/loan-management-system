import { toast } from 'react-toastify';

// Notification types
export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_UPDATED: 'APPLICATION_UPDATED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  STATUS_CHANGE: 'STATUS_CHANGE',
  ERROR: 'ERROR'
};

// Store notifications in localStorage
const saveNotification = (notification) => {
  try {
    const notifications = JSON.parse(localStorage.getItem('loanNotifications') || '[]');
    notifications.unshift({
      ...notification,
      timestamp: Date.now(),
      read: false
    });
    localStorage.setItem('loanNotifications', JSON.stringify(notifications.slice(0, 50))); // Keep last 50 notifications
  } catch (error) {
    console.error('Error saving notification:', error);
  }
};

// Show toast notification
const showToast = (message, type = 'info') => {
  toast[type](message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

// Handle application submission notification
export const notifyApplicationSubmitted = (applicationId) => {
  const notification = {
    type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
    message: `Loan application #${applicationId} submitted successfully`,
    applicationId
  };
  saveNotification(notification);
  showToast(notification.message, 'success');
};

// Handle document upload notification
export const notifyDocumentUploaded = (documentName, applicationId) => {
  const notification = {
    type: NOTIFICATION_TYPES.DOCUMENT_UPLOADED,
    message: `Document "${documentName}" uploaded successfully`,
    applicationId
  };
  saveNotification(notification);
  showToast(notification.message);
};

// Handle application status change
export const notifyStatusChange = (applicationId, newStatus) => {
  const notification = {
    type: NOTIFICATION_TYPES.STATUS_CHANGE,
    message: `Application #${applicationId} status changed to ${newStatus}`,
    applicationId,
    status: newStatus
  };
  saveNotification(notification);
  showToast(notification.message, 'info');
};

// Get unread notifications count
export const getUnreadCount = () => {
  try {
    const notifications = JSON.parse(localStorage.getItem('loanNotifications') || '[]');
    return notifications.filter(n => !n.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Mark notifications as read
export const markAsRead = (notificationIds) => {
  try {
    const notifications = JSON.parse(localStorage.getItem('loanNotifications') || '[]');
    const updatedNotifications = notifications.map(notification => 
      notificationIds.includes(notification.id) 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem('loanNotifications', JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
};

// Get all notifications
export const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem('loanNotifications') || '[]');
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}; 