import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';

const MetricCard = ({ title, value = 0, icon, trend, colorType = 'primary', prefix = '', suffix = '' }) => {
  const theme = useTheme();
  const formattedValue = `${prefix}${(value || 0).toLocaleString()}${suffix}`;
  const color = theme.palette[colorType].main;

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 4px 20px ${alpha(color, 0.2)}`,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: alpha(color, 0.1),
              color: color
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      
      <Typography variant="h4" sx={{ mb: 1, color: 'text.primary' }}>
        {formattedValue}
      </Typography>

      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: trend.type === 'increase' 
                ? theme.palette.success.main 
                : theme.palette.error.main
            }}
          >
            {trend.value}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            vs last month
          </Typography>
        </Box>
      )}
    </Box>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.element,
  trend: PropTypes.shape({
    value: PropTypes.number,
    type: PropTypes.oneOf(['increase', 'decrease'])
  }),
  colorType: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  prefix: PropTypes.string,
  suffix: PropTypes.string
};

export default MetricCard; 