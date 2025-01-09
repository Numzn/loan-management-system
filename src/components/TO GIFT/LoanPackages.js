import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Check as CheckIcon,
  BusinessCenter as BusinessIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LOAN_TYPES } from '../../constants/loanTypes';

const PACKAGE_ICONS = {
  BUSINESS: <BusinessIcon fontSize="large" />,
  PERSONAL: <PersonIcon fontSize="large" />,
  GRZ: <WorkIcon fontSize="large" />,
  SALARY_ADVANCE: <BankIcon fontSize="large" />
};

export default function LoanPackages() {
  const navigate = useNavigate();

  const handleApply = (loanType) => {
    navigate(`/calculator/${loanType.toLowerCase()}`, {
      state: { preselectedType: loanType }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Choose Your Loan Package
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 6 }}>
        Select from our range of tailored loan solutions
      </Typography>

      <Grid container spacing={4}>
        {Object.entries(LOAN_TYPES).map(([key, loan]) => (
          <Grid item xs={12} md={6} lg={3} key={key}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  gap: 1
                }}
              >
                <Chip 
                  label={`${loan.monthlyInterestRate}% Interest`}
                  color="primary"
                  size="small"
                />
                <Chip 
                  label={`${loan.serviceFee}% Fee`}
                  color="secondary"
                  size="small"
                />
              </Box>

              <CardContent sx={{ pt: 6, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {PACKAGE_ICONS[key]}
                  <Typography variant="h5" component="div" sx={{ ml: 1 }}>
                    {loan.name}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  Amount Range: K{loan.minAmount.toLocaleString()} - K{loan.maxAmount.toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                  Duration: {loan.minDuration} - {loan.maxDuration} months
                </Typography>

                <List dense>
                  {loan.eligibilityCriteria.slice(0, 3).map((criteria, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={criteria}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth 
                  variant="contained"
                  onClick={() => handleApply(key)}
                >
                  Apply Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 