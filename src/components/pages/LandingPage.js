import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography, 
  Grid,
  Card,
  CardContent,
  Dialog,
  IconButton,
  useTheme,
  useMediaQuery,
  Slide,
  Avatar,
  Rating,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, #002044 30%, #fd7c07 90%)`,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  color: '#ffffff',
  padding: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const CTAButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#fd7c07',
  color: '#ffffff',
  borderRadius: '25px',
  padding: '12px 32px',
  '&:hover': {
    backgroundColor: '#e66e06',
  },
}));

// New styled components for testimonials
const TestimonialCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
      height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: '16px',
  boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
  background: '#ffffff',
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-8px)',
  },
}));

// Loan types data
const loanTypes = [
  {
    title: 'GRZ Loans',
    description: 'Specialized loans for government employees with competitive rates and flexible terms.',
    details: {
      overview: 'Tailored financial solutions for government employees.',
      rates: '12% - 15% p.a.',
      range: 'K5,000 - K100,000',
      eligibility: [
        'Must be a government employee',
        'Minimum 6 months employment',
        'Clean credit history'
      ],
      documents: [
        'Valid government ID',
        'Recent payslips',
        'Bank statements'
      ]
    }
  },
  {
    title: 'Salary Advances',
    description: 'Quick access to funds before your next payday with minimal documentation.',
    details: {
      overview: 'Short-term financial solutions for immediate needs.',
      rates: '10% - 12% p.a.',
      range: 'K1,000 - K20,000',
      eligibility: [
        'Regular employment',
        'Minimum 3 months employment',
        'Stable income'
      ],
      documents: [
        'Employment ID',
        'Latest payslip',
        'Bank statement'
      ]
    }
  },
  {
    title: 'Business Loans',
    description: 'Empower your business growth with our flexible business financing options.',
    details: {
      overview: 'Comprehensive business financing solutions.',
      rates: '15% - 18% p.a.',
      range: 'K10,000 - K500,000',
      eligibility: [
        'Registered business',
        'Minimum 1 year operation',
        'Good financial records'
      ],
      documents: [
        'Business registration',
        'Financial statements',
        'Business plan'
      ]
    }
  },
  {
    title: 'Personal Loans',
    description: 'Achieve your personal goals with our customized personal loan solutions.',
    details: {
      overview: 'Flexible personal financing for various needs.',
      rates: '14% - 16% p.a.',
      range: 'K3,000 - K50,000',
      eligibility: [
        'Regular income',
        'Age 21-55',
        'Credit check required'
      ],
      documents: [
        'National ID',
        'Proof of income',
        'Utility bill'
      ]
    }
  }
];

// Testimonials data
const testimonials = [
  {
    name: "John Mulenga",
    role: "Business Owner",
    avatar: "/avatars/john.jpg",
    rating: 5,
    text: "The business loan process was incredibly smooth. The team was professional and helped me every step of the way.",
  },
  {
    name: "Sarah Banda",
    role: "Government Employee",
    avatar: "/avatars/sarah.jpg",
    rating: 5,
    text: "I got my GRZ loan approved within days. The interest rates are competitive and the terms are flexible.",
  },
  {
    name: "Michael Phiri",
    role: "Teacher",
    avatar: "/avatars/michael.jpg",
    rating: 5,
    text: "The salary advance helped me during a difficult time. The application process was quick and straightforward.",
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const LoanDetailsDialog = ({ open, handleClose, loanDetails, onApplyNow }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      maxWidth="md"
      fullWidth
    >
      <Box sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color="#002044">
            {loanDetails?.title}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Typography variant="h6" color="#002044" gutterBottom>Overview</Typography>
        <Typography paragraph>{loanDetails?.details.overview}</Typography>
        
        <Typography variant="h6" color="#002044" gutterBottom>Interest Rates</Typography>
        <Typography paragraph>{loanDetails?.details.rates}</Typography>
        
        <Typography variant="h6" color="#002044" gutterBottom>Loan Amount Range</Typography>
        <Typography paragraph>{loanDetails?.details.range}</Typography>
        
        <Typography variant="h6" color="#002044" gutterBottom>Eligibility Criteria</Typography>
        <ul>
          {loanDetails?.details.eligibility.map((item, index) => (
            <Typography component="li" key={index} paragraph>{item}</Typography>
          ))}
        </ul>
        
        <Typography variant="h6" color="#002044" gutterBottom>Required Documents</Typography>
        <ul>
          {loanDetails?.details.documents.map((item, index) => (
            <Typography component="li" key={index} paragraph>{item}</Typography>
          ))}
        </ul>
        
        <Box mt={3} display="flex" justifyContent="center">
          <CTAButton
            variant="contained"
            size="large"
            onClick={onApplyNow}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply Now
          </CTAButton>
        </Box>
      </Box>
    </Dialog>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const { mockLogin } = useUser();

  const handleLearnMore = (loan) => {
    setSelectedLoan(loan);
  };

  const handleApplyNow = (loanType = '') => {
    navigate('/calculator', { 
      state: { 
        isApplicationFlow: true,
        step: 1,
        totalSteps: 7,
        preselectedType: loanType
      } 
    });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{
                whiteSpace: 'pre-line',
                lineHeight: 1.2,
                fontWeight: 600
              }}
            >
              Your Financial Goals,{'\n'}
              Our Trusted Loans
            </Typography>
            <Typography variant="h5" paragraph>
              Flexible, secure, and personalized loan solutions tailored for you
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CTAButton
                variant="contained"
                size="large"
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleApplyNow()}
              >
                Apply Now
              </CTAButton>
              <Button
                variant="outlined"
                size="large"
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                sx={{
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  '&:hover': {
                    borderColor: '#fd7c07',
                    backgroundColor: 'rgba(253, 124, 7, 0.1)',
                  },
                }}
              >
                Login
              </Button>
            </Box>
          </motion.div>
        </Container>
      </HeroSection>

      {/* Loan Services Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
        <Typography variant="h3" align="center" color="#002044" gutterBottom>
          Our Loan Services
        </Typography>
        </motion.div>
        <Grid container spacing={4} sx={{ mt: 4 }} component={motion.div} variants={staggerContainer} initial="hidden" animate="visible">
          {loanTypes.map((loan, index) => (
            <Grid item xs={12} sm={6} md={3} key={loan.title} component={motion.div} variants={fadeInUp}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h5" color="#002044" gutterBottom>
                    {loan.title}
                  </Typography>
                  <Typography paragraph>
                    {loan.description}
                  </Typography>
                  <Box mt="auto">
                <Button
                      variant="contained"
                      sx={{ bgcolor: '#fd7c07', '&:hover': { bgcolor: '#e66e06' } }}
                      onClick={() => handleLearnMore(loan)}
                      component={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
          </Grid>
        </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Typography variant="h3" align="center" color="#002044" gutterBottom>
              What Our Clients Say
            </Typography>
          </motion.div>
          <Grid container spacing={4} sx={{ mt: 4 }} component={motion.div} variants={staggerContainer} initial="hidden" animate="visible">
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index} component={motion.div} variants={fadeInUp}>
                <TestimonialCard>
                  <Avatar
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sx={{ width: 80, height: 80, mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {testimonial.role}
                  </Typography>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    "{testimonial.text}"
          </Typography>
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" component={motion.div} variants={staggerContainer} initial="hidden" animate="visible">
            <Grid item xs={12} md={6} component={motion.div} variants={fadeInUp}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h3" color="#002044" gutterBottom>
                  Why Choose Us?
                </Typography>
                <Typography variant="h6" paragraph component={motion.div} whileHover={{ x: 10 }}>
                  • Competitive interest rates
                </Typography>
                <Typography variant="h6" paragraph component={motion.div} whileHover={{ x: 10 }}>
                  • Flexible repayment terms
                </Typography>
                <Typography variant="h6" paragraph component={motion.div} whileHover={{ x: 10 }}>
                  • Transparent and straightforward loan processes
                </Typography>
                <Typography variant="h6" paragraph component={motion.div} whileHover={{ x: 10 }}>
                  • Quick approval process
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} component={motion.div} variants={fadeInUp}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    width: '100%',
                    height: 300,
                    bgcolor: '#002044',
                    borderRadius: 2,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer with animation */}
      <Box sx={{ bgcolor: '#002044', color: '#ffffff', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} component={motion.div} variants={staggerContainer} initial="hidden" animate="visible">
            <Grid item xs={12} md={4} component={motion.div} variants={fadeInUp}>
              <Typography variant="h6" gutterBottom>
                About Us
              </Typography>
              <Typography>
                We provide trusted loan solutions to help you achieve your financial goals.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} component={motion.div} variants={fadeInUp}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Typography component={motion.div} whileHover={{ x: 10 }}>FAQ</Typography>
              <Typography component={motion.div} whileHover={{ x: 10 }}>Terms & Conditions</Typography>
              <Typography component={motion.div} whileHover={{ x: 10 }}>Privacy Policy</Typography>
            </Grid>
            <Grid item xs={12} md={4} component={motion.div} variants={fadeInUp}>
              <Typography variant="h6" gutterBottom>
                Contact Us
            </Typography>
              <Typography component={motion.div} whileHover={{ x: 10 }}>Email: info@example.com</Typography>
              <Typography component={motion.div} whileHover={{ x: 10 }}>Phone: +260 XXX XXX XXX</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, textAlign: 'center' }} component={motion.div} variants={fadeInUp}>
            <Typography>
              © 2024 Your Company Name. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Loan Details Dialog */}
      <LoanDetailsDialog
        open={Boolean(selectedLoan)}
        handleClose={() => setSelectedLoan(null)}
        loanDetails={selectedLoan}
        onApplyNow={() => {
          handleApplyNow(selectedLoan?.title?.replace(/\s+/g, '_').toUpperCase());
          setSelectedLoan(null);
        }}
      />
    </Box>
  );
};

export default LandingPage; 