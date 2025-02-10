import { supabase } from '../utils/supabaseClient';

const baseNotificationService = {
  // Fetch notifications for a user
  async getNotifications(userId, role) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('role', role)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
};

export const financeNotifications = {
  ...baseNotificationService,
  getMockNotifications() {
    return [
      {
        id: 1,
        message: 'New loan approved, pending disbursement',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'pending_disbursement'
      },
      {
        id: 2,
        message: 'Disbursement successful for Loan #12345',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        type: 'disbursement_success'
      },
      {
        id: 3,
        message: 'Bank details updated for Loan #67890',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        type: 'bank_details_update'
      }
    ];
  }
};

export const managerNotifications = {
  ...baseNotificationService,
  getMockNotifications() {
    return [
      {
        id: 1,
        message: 'New loan application submitted',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'new_application'
      },
      {
        id: 2,
        message: 'Loan #12345 requires review',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        type: 'review_required'
      }
    ];
  }
}; 