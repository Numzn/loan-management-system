import { alpha } from '@mui/material/styles';

export const getKanbanStyles = (theme) => {
  return {
    column: {
      padding: theme.spacing(2),
      background: alpha(theme.palette.background.paper, 0.05),
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
      },
      '& .MuiTypography-root': {
        color: theme.palette.text.primary,
      }
    },
    card: {
      padding: theme.spacing(2.5),
      marginBottom: theme.spacing(2),
      background: alpha(theme.palette.background.paper, 0.7),
      backdropFilter: 'blur(8px)',
      borderRadius: '12px',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'grab',
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.3)}`,
      },
      '&:active': {
        cursor: 'grabbing',
        transform: 'scale(1.05)',
      }
    },
    chip: {
      borderRadius: '8px',
      '& .MuiChip-icon': {
        color: 'inherit',
      },
      '& .MuiChip-label': {
        fontWeight: 600,
      }
    }
  };
};

export const getStatusColors = (theme) => ({
  new_review: {
    color: theme.palette.warning.main,
    bgColor: alpha(theme.palette.warning.main, 0.1)
  },
  approved: {
    color: theme.palette.success.main,
    bgColor: alpha(theme.palette.success.main, 0.1)
  },
  disbursed: {
    color: theme.palette.info.main,
    bgColor: alpha(theme.palette.info.main, 0.1)
  },
  rejected: {
    color: theme.palette.error.main,
    bgColor: alpha(theme.palette.error.main, 0.1)
  },
  pending_funding: {
    color: theme.palette.warning.main,
    bgColor: alpha(theme.palette.warning.main, 0.1)
  },
  awaiting_funds: {
    color: theme.palette.warning.main,
    bgColor: alpha(theme.palette.warning.main, 0.1)
  }
}); 