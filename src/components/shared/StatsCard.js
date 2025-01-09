import { Paper, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function StatsCard({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  color = 'primary'
}) {
  const percentageChange = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;

  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {formatValue(value)}
          </Typography>
        </Box>
        {Icon && (
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              p: 1,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ color: `${color}.main` }} />
          </Box>
        )}
      </Box>
      {previousValue && (
        <Box display="flex" alignItems="center" mt={2}>
          {percentageChange > 0 ? (
            <TrendingUpIcon color="success" />
          ) : (
            <TrendingDownIcon color="error" />
          )}
          <Typography
            variant="body2"
            color={percentageChange > 0 ? 'success.main' : 'error.main'}
            ml={1}
          >
            {Math.abs(percentageChange).toFixed(1)}% from last period
          </Typography>
        </Box>
      )}
    </Paper>
  );
} 