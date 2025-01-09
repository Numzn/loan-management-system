import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  Calculate,
  Speed,
  Security,
  AccountBalance,
  TouchApp,
  Assignment,
} from '@mui/icons-material';

const FeatureCard = ({ icon, title, description }) => (
  <Card 
    elevation={0}
    sx={{ 
      height: '100%',
      backgroundColor: 'transparent',
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-8px)',
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box
          sx={{
            p: 2,
            borderRadius: '50%',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <Calculate fontSize="large" />,
      title: 'Loan Calculator',
      description: 'Get instant estimates with our advanced loan calculator',
    },
    {
      icon: <Speed fontSize="large" />,
      title: 'Quick Process',
      description: 'Fast and efficient loan application process',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Secure Platform',
      description: 'Your data is protected with bank-grade security',
    },
    {
      icon: <AccountBalance fontSize="large" />,
      title: 'Multiple Loan Types',
      description: 'Various loan options tailored to your needs',
    },
    {
      icon: <TouchApp fontSize="large" />,
      title: 'Easy Application',
      description: 'Simple and intuitive application process',
    },
    {
      icon: <Assignment fontSize="large" />,
      title: 'Track Progress',
      description: 'Monitor your application status in real-time',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) => `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  background: (theme) => 
                    `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Smart Loan Solutions for Your Future
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                Get the financial support you need with our easy-to-use loan management platform
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/calculator')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '30px',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/calculator')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '30px',
                  }}
                >
                  Calculate Loan
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/loan-hero-image.png"
                alt="Loan Management"
                sx={{
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto',
                  display: 'block',
                  margin: 'auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h3"
          align="center"
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Why Choose Us
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 8 }}
        >
          Experience the best loan management platform with our feature-rich solution
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: (theme) => theme.palette.mode === 'dark' 
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.primary.main, 0.05),
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of satisfied customers who trust our loan management platform
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/calculator')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: '30px',
              }}
            >
              Apply Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 