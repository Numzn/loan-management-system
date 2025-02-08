import React from 'react';
import { Paper, Box, Typography, alpha, styled } from '@mui/material';
import { colors } from '../../../theme/colors';

// Modern color palette (matching Kanban board)
const colors = {
  primary: '#2563eb',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#6366f1',
  purple: '#7c3aed',
  background: '#0f172a',
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8'
  }
};

const StyledMetricCard = styled(Paper)(({ theme, color = colors.primary }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: `1px solid ${alpha(color, 0.1)}`,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 4px 20px ${alpha(color, 0.2)}`,
  }
}));

const MetricCard = ({ title, value, icon, color = colors.primary, prefix = '', suffix = '' }) => {
  return (
    <StyledMetricCard color={color}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.text.secondary,
              fontSize: '0.875rem',
              mb: 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              color: colors.text.primary,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            {prefix && <span style={{ fontSize: '1rem', opacity: 0.7 }}>{prefix}</span>}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span style={{ fontSize: '1rem', opacity: 0.7 }}>{suffix}</span>}
          </Typography>
        </Box>
        <Box 
          sx={{ 
            p: 1,
            borderRadius: '12px',
            bgcolor: alpha(color, 0.1),
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
    </StyledMetricCard>
  );
};

export default MetricCard; 