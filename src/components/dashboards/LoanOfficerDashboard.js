import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Visibility,
  AttachFile,
  CheckCircle,
  Warning,
  Schedule,
  Search,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { supabase, TABLES, LOAN_STATUS } from '../../config/supabaseClient';
import { formatCurrency } from '../../utils/formatters';
import { StyledCard } from '../../theme/components';

const statusChipProps = {
  [LOAN_STATUS.DRAFT]: { label: 'Draft', color: 'default', icon: <Schedule /> },
  [LOAN_STATUS.SUBMITTED]: { label: 'Submitted', color: 'info', icon: <Schedule /> },
  [LOAN_STATUS.UNDER_REVIEW]: { label: 'Under Review', color: 'warning', icon: <Schedule /> },
  [LOAN_STATUS.APPROVED]: { label: 'Approved', color: 'success', icon: <CheckCircle /> },
  [LOAN_STATUS.REJECTED]: { label: 'Rejected', color: 'error', icon: <Warning /> },
  [LOAN_STATUS.DISBURSED]: { label: 'Disbursed', color: 'success', icon: <CheckCircle /> },
  [LOAN_STATUS.CLOSED]: { label: 'Closed', color: 'default', icon: <CheckCircle /> },
};

const StatsCard = ({ title, value, icon: Icon, color = 'primary' }) => (
  <StyledCard>
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {Icon && <Icon sx={{ mr: 1, color: `${color}.main` }} />}
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ color: `${color}.main` }}>
        {value}
      </Typography>
    </Box>
  </StyledCard>
);

const ApplicationsTable = ({ applications, loading, onViewApplication }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Application ID</TableCell>
            <TableCell>Applicant Name</TableCell>
            <TableCell>Loan Amount</TableCell>
            <TableCell>Purpose</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Documents</TableCell>
            <TableCell>Submitted At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => {
            const statusProps = statusChipProps[app.status] || statusChipProps[LOAN_STATUS.DRAFT];
            return (
              <TableRow key={app.id} hover>
                <TableCell>{app.application_id}</TableCell>
                <TableCell>{app.applicant_name}</TableCell>
                <TableCell>{formatCurrency(app.loan_amount)}</TableCell>
                <TableCell>{app.loan_purpose}</TableCell>
                <TableCell>
                  <Chip
                    icon={statusProps.icon}
                    label={statusProps.label}
                    color={statusProps.color}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {app.documents?.map((doc, index) => (
                      <Tooltip key={index} title={`${doc.document_type}: ${doc.file_name}`}>
                        <IconButton size="small">
                          <AttachFile fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => onViewApplication(app.id)} size="small">
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function LoanOfficerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [currentTab, setCurrentTab] = useState(0);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(TABLES.LOAN_APPLICATIONS)
        .select(`
          *,
          documents:${TABLES.LOAN_DOCUMENTS}(*)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`applicant_name.ilike.%${filters.search}%,application_id.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Calculate stats
      const newStats = {
        submitted: 0,
        under_review: 0,
          approved: 0,
        rejected: 0,
      };

      data.forEach(app => {
        if (newStats.hasOwnProperty(app.status)) {
          newStats[app.status]++;
        }
      });

      setApplications(data);
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setFilters(prev => ({
      ...prev,
      status: newValue === 0 ? '' : 
             newValue === 1 ? LOAN_STATUS.SUBMITTED :
             newValue === 2 ? LOAN_STATUS.UNDER_REVIEW :
             newValue === 3 ? LOAN_STATUS.APPROVED : ''
    }));
  };

  const handleSearch = (event) => {
    setFilters(prev => ({
      ...prev,
      search: event.target.value
    }));
  };

  const handleViewApplication = (id) => {
    navigate(`/loan-officer/applications/${id}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Loan Officer Dashboard
        </Typography>
        <Typography color="textSecondary">
          Manage and review loan applications
        </Typography>
        </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
            title="Submitted"
            value={stats.submitted}
            icon={Schedule}
            color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Under Review"
            value={stats.under_review}
            icon={Schedule}
            color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Approved"
              value={stats.approved}
            icon={CheckCircle}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Rejected"
              value={stats.rejected}
            icon={Warning}
              color="error"
            />
          </Grid>
      </Grid>

      {/* Applications Section */}
      <Paper sx={{ mb: 4 }}>
        {/* Filters */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="All Applications" />
            <Tab label="New Submissions" />
            <Tab label="Under Review" />
            <Tab label="Approved" />
          </Tabs>
        </Box>

        {/* Search and Actions */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search applications..."
            value={filters.search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            startIcon={<FilterList />}
            variant="outlined"
            onClick={() => {}}
          >
            Filters
          </Button>
          <Button
            startIcon={<Refresh />}
            variant="outlined"
            onClick={fetchApplications}
          >
            Refresh
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Applications Table */}
        <ApplicationsTable
          applications={applications}
          loading={loading}
          onViewApplication={handleViewApplication}
        />
      </Paper>
    </Container>
  );
} 