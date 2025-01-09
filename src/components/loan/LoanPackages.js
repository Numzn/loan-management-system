import { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Check as CheckIcon,
  BusinessCenter as BusinessIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AccountBalance as BankIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { styled } from '@mui/material/styles';
import { formatCurrency } from '../../utils/formatters';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const PACKAGE_ICONS = {
  BUSINESS: <BusinessIcon fontSize="large" />,
  PERSONAL: <PersonIcon fontSize="large" />,
  GRZ: <WorkIcon fontSize="large" />,
  SALARY_ADVANCE: <BankIcon fontSize="large" />
};

const PACKAGE_COLORS = {
  BUSINESS: '#1976d2',
  PERSONAL: '#2e7d32',
  GRZ: '#d32f2f',
  SALARY_ADVANCE: '#ed6c02'
};

export default function LoanPackages() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState(null);

  const handleExpandClick = (key) => {
    setExpandedCard(expandedCard === key ? null : key);
  };

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

      <Box
        sx={{
          perspective: '2000px',
          transformStyle: 'preserve-3d',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -40,
            left: '10%',
            right: '10%',
            height: '40px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%)',
            filter: 'blur(20px)',
            borderRadius: '50%',
            zIndex: -1
          }
        }}
      >
        <Grid 
          container 
          spacing={4}
          sx={{
            transform: 'rotateX(10deg) rotateY(-5deg)',
            transformStyle: 'preserve-3d',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
              transform: 'translateZ(-50px)',
              pointerEvents: 'none'
            }
          }}
        >
          {Object.entries(LOAN_TYPES).map(([key, loan], index) => (
            <Grid 
              item 
              xs={12} 
              md={6} 
              lg={3} 
              key={key}
              sx={{
                transform: `translateZ(${index * 20}px)`,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: `translateZ(${index * 20 + 40}px) scale(1.05)`,
                }
              }}
            >
              <Card 
                sx={{ 
                  height: expandedCard === key ? '100%' : '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `
                      0 14px 28px rgba(0,0,0,0.25),
                      0 10px 10px rgba(0,0,0,0.22),
                      0 0 0 1px rgba(0,0,0,0.05)
                    `,
                    '&::before': {
                      opacity: 1,
                    },
                    '&::after': {
                      opacity: 1,
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, 
                      ${PACKAGE_COLORS[key]} 0%, 
                      ${PACKAGE_COLORS[key]}dd 100%
                    )`,
                    boxShadow: `0 0 10px ${PACKAGE_COLORS[key]}66`,
                    zIndex: 2
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '4px',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: `
                      linear-gradient(90deg, ${PACKAGE_COLORS[key]}40 0%, transparent 1px),
                      linear-gradient(90deg, transparent calc(100% - 1px), ${PACKAGE_COLORS[key]}40 100%)
                    `,
                    opacity: 0.7,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                    zIndex: 1
                  },
                  '& > *:last-child::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: `linear-gradient(90deg,
                      transparent 0%,
                      ${PACKAGE_COLORS[key]}40 20%,
                      ${PACKAGE_COLORS[key]}40 80%,
                      transparent 100%
                    )`,
                    opacity: 0.7,
                    pointerEvents: 'none'
                  },
                  '& > *:first-of-type::before, & > *:first-of-type::after': {
                    content: '""',
                    position: 'absolute',
                    width: '12px',
                    height: '12px',
                    border: `2px solid ${PACKAGE_COLORS[key]}40`,
                    zIndex: 2
                  },
                  '& > *:first-of-type::before': {
                    top: '8px',
                    left: '8px',
                    borderRight: 'none',
                    borderBottom: 'none'
                  },
                  '& > *:first-of-type::after': {
                    top: '8px',
                    right: '8px',
                    borderLeft: 'none',
                    borderBottom: 'none'
                  },
                  '& > *:last-child::before, & > *:last-child::after': {
                    content: '""',
                    position: 'absolute',
                    width: '12px',
                    height: '12px',
                    border: `2px solid ${PACKAGE_COLORS[key]}40`,
                    bottom: '8px',
                    zIndex: 2
                  },
                  '& > *:last-child::before': {
                    left: 8,
                    borderRight: 'none',
                    borderTop: 'none'
                  },
                  '& > *:last-child::after': {
                    right: 8,
                    borderLeft: 'none',
                    borderTop: 'none'
                  }
                }}
              >
                <CardHeader
                  sx={{ 
                    pb: 0.5,
                    '& .MuiCardHeader-title': {
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'primary.dark',
                      textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
                      letterSpacing: '0.5px'
                    },
                    '& .MuiCardHeader-subheader': {
                      fontSize: '0.85rem',
                      color: 'text.primary',
                      textShadow: '0.5px 0.5px 0.5px rgba(0,0,0,0.05)'
                    }
                  }}
                  avatar={
                    <Avatar 
                      sx={{ 
                        bgcolor: PACKAGE_COLORS[key],
                        transform: 'scale(0.9)'
                      }}
                    >
                      {PACKAGE_ICONS[key]}
                    </Avatar>
                  }
                  action={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mr: 0.5 }}>
                      <Chip 
                        label={`${loan.monthlyInterestRate}%`}
                        color="primary"
                        size="small"
                        variant="outlined"
                        sx={{ height: '24px' }}
                      />
                    </Box>
                  }
                  title={loan.name}
                  subheader={`${loan.minDuration}-${loan.maxDuration} months`}
                />

                <CardContent sx={{ 
                  flexGrow: 1, 
                  pt: 0.5, 
                  pb: 1,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    zIndex: 0
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="h6" 
                      color="primary.dark"
                      gutterBottom 
                      sx={{ 
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {formatCurrency(loan.minAmount)} - {formatCurrency(loan.maxAmount)}
                    </Typography>

                    <List dense sx={{ pt: 0 }}>
                      {loan.eligibilityCriteria.slice(0, 2).map((criteria, index) => (
                        <ListItem 
                          key={index} 
                          disableGutters 
                          sx={{ 
                            minHeight: '32px',
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: '4px',
                            mb: 0.5,
                            px: 1
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 26 }}>
                            <CheckIcon 
                              color="success" 
                              sx={{ 
                                fontSize: '0.9rem',
                                filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))'
                              }} 
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={criteria}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.primary',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              textShadow: '0.5px 0.5px 0.5px rgba(0,0,0,0.05)',
                              sx: {
                                textWrap: 'balance'
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </CardContent>

                <CardActions disableSpacing sx={{ mt: 'auto' }}>
                  <Button 
                    variant="contained"
                    onClick={() => handleApply(key)}
                    sx={{ 
                      bgcolor: PACKAGE_COLORS[key],
                      '&:hover': {
                        bgcolor: PACKAGE_COLORS[key]
                      }
                    }}
                  >
                    Apply Now
                  </Button>
                  <ExpandMore
                    expand={expandedCard === key}
                    onClick={() => handleExpandClick(key)}
                    aria-expanded={expandedCard === key}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </CardActions>

                <Collapse in={expandedCard === key} timeout="auto" unmountOnExit>
                  <CardContent>
                    {loan.eligibilityCriteria.slice(2).length > 0 && (
                      <>
                        <Typography 
                          variant="subtitle2" 
                          gutterBottom
                          sx={{
                            color: 'primary.dark',
                            fontWeight: 600,
                            textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Additional Eligibility Criteria:
                        </Typography>
                        <List dense>
                          {loan.eligibilityCriteria.slice(2).map((criteria, index) => (
                            <ListItem 
                              key={index} 
                              disableGutters
                              sx={{
                                background: 'rgba(255,255,255,0.7)',
                                borderRadius: '4px',
                                mb: 0.5,
                                px: 1
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckIcon 
                                  color="success" 
                                  fontSize="small"
                                  sx={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={criteria}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  color: 'text.primary',
                                  fontWeight: 500,
                                  textShadow: '0.5px 0.5px 0.5px rgba(0,0,0,0.05)',
                                  sx: { textWrap: 'balance' }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Required Documents:
                    </Typography>
                    <List dense>
                      {loan.requiredDocuments.map((doc, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <InfoIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={doc}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.secondary'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
} 