import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  IconButton,
} from '@mui/material';
import {
  NotificationsOutlined,
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
  WarningOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { StyledCard } from '../../theme/components';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircleOutline sx={{ color: 'success.main' }} />;
    case 'error':
      return <ErrorOutline sx={{ color: 'error.main' }} />;
    case 'warning':
      return <WarningOutlined sx={{ color: 'warning.main' }} />;
    default:
      return <InfoOutlined sx={{ color: 'info.main' }} />;
  }
};

const ApplicationNotifications = () => {
  // This would come from your backend/context
  const notifications = [
    {
      id: 1,
      type: 'success',
      message: 'Your application has been successfully submitted',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      message: 'Document verification in progress',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'warning',
      message: 'Additional documents required: Latest bank statement',
      timestamp: '30 minutes ago',
      read: false,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <StyledCard>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="#002044" sx={{ flexGrow: 1 }}>
            Application Updates
          </Typography>
          <IconButton>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Box>

        <List>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ListItem
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'rgba(253, 124, 7, 0.05)',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={notification.timestamp}
                  primaryTypographyProps={{
                    variant: 'body1',
                    color: notification.read ? 'text.primary' : '#002044',
                    fontWeight: notification.read ? 'normal' : 500,
                  }}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>
    </StyledCard>
  );
};

export default ApplicationNotifications; 