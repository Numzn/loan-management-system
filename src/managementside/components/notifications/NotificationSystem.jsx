import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useUser } from '../../../contexts/UserContext';
import { managerNotifications } from '../../../services/notificationService';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    const loadNotifications = async () => {
      const mockData = managerNotifications.getMockNotifications();
      setNotifications(mockData);
      setUnreadCount(mockData.filter(n => !n.read).length);
    };

    loadNotifications();
  }, [user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id
            ? { ...n, read: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // For production, uncomment this:
      // await notificationService.markAsRead(notification.id);
    }
    handleClose();
  };

  const getNotificationColor = (type) => {
    const colors = {
      pending_disbursement: '#ff9800',
      disbursement_success: '#4caf50',
      bank_details_update: '#2196f3',
      new_application: '#9c27b0',
      review_required: '#f44336',
      default: '#757575'
    };
    return colors[type] || colors.default;
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 360,
            mt: 1.5
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                borderLeft: 3,
                borderColor: getNotificationColor(notification.type),
                bgcolor: notification.read ? 'transparent' : 'action.hover'
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationSystem; 