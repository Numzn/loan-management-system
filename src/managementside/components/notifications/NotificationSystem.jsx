import React, { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  FiberNew as FiberNewIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

// Create Audio element for notification sound
const notificationSound = new Audio('/notification-sound.mp3');

export default function NotificationSystem() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle notification sound
  const playNotificationSound = useCallback(() => {
    notificationSound.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('recipientRole', '==', 'loan_officer'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = [];
      let newUnreadCount = 0;

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // Play sound for new notifications
          playNotificationSound();
        }
      });

      snapshot.forEach((doc) => {
        const notification = {
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        };
        newNotifications.push(notification);
        if (!notification.isRead) {
          newUnreadCount++;
        }
      });

      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    });

    return () => unsubscribe();
  }, [playNotificationSound]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        // Update notification status in Firestore
        await updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true
        });

        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: '350px',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>

        {notifications.length === 0 ? (
          <MenuItem>
            <Typography color="textSecondary">No notifications</Typography>
          </MenuItem>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  }}
                >
                  <ListItemIcon>
                    {notification.isRead ? (
                      <CheckIcon color="success" />
                    ) : (
                      <FiberNewIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          {notification.message}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="caption"
                          color="textSecondary"
                        >
                          {notification.timestamp?.toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
} 