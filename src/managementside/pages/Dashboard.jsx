import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assessment,
  Warning,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          {React.cloneElement(icon, { sx: { color } })}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={70} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: `${color}15`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          }
        }} 
      />
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Applications',
      value: '2,345',
      icon: <Assessment />,
      color: '#2196F3',
    },
    {
      title: 'Active Users',
      value: '1,234',
      icon: <People />,
      color: '#4CAF50',
    },
    {
      title: 'Pending Approvals',
      value: '45',
      icon: <Warning />,
      color: '#FFC107',
    },
    {
      title: 'Monthly Growth',
      value: '+15%',
      icon: <TrendingUp />,
      color: '#9C27B0',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Applications */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Loan Applications
            </Typography>
            {/* Add table or list of recent applications */}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            {/* Add quick action buttons */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 