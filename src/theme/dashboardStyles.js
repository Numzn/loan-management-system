import { alpha } from '@mui/material/styles';

export const getStatusColors = (theme) => ({
  new_review: {
    color: theme.palette.warning.main,
    bgColor: alpha(theme.palette.warning.main, 0.1),
    icon: 'AccessTime'
  },
  approved: {
    color: theme.palette.success.main,
    bgColor: alpha(theme.palette.success.main, 0.1),
    icon: 'Done'
  },
  disbursed: {
    color: theme.palette.info.main,
    bgColor: alpha(theme.palette.info.main, 0.1),
    icon: 'AttachMoney'
  },
  rejected: {
    color: theme.palette.error.main,
    bgColor: alpha(theme.palette.error.main, 0.1),
    icon: 'ErrorOutline'
  },
  pending_funding: {
    color: theme.palette.warning.main,
    bgColor: alpha(theme.palette.warning.main, 0.1),
    icon: 'Schedule'
  },
  awaiting_funds: {
    color: theme.palette.warning.main,
    bgColor: alpha(theme.palette.warning.main, 0.1),
    icon: 'Warning'
  }
});

export const dashboardColumns = {
  manager: [
    {
      id: 'new_review',
      title: 'New Review'
    },
    {
      id: 'approved',
      title: 'Approved'
    },
    {
      id: 'disbursed',
      title: 'Disbursed'
    },
    {
      id: 'rejected',
      title: 'Rejected'
    }
  ],
  loanOfficer: [
    {
      id: 'new_review',
      title: 'New Review'
    },
    {
      id: 'approved',
      title: 'Approved'
    },
    {
      id: 'rejected',
      title: 'Rejected'
    }
  ],
  finance: [
    {
      id: 'approved',
      title: 'Approved'
    },
    {
      id: 'pending_funding',
      title: 'Pending Funding'
    },
    {
      id: 'disbursed',
      title: 'Disbursed'
    }
  ]
};

export const metricCardTypes = {
  pendingReview: {
    title: 'Pending Review',
    icon: 'Timeline',
    colorType: 'warning',
    getValue: (metrics) => metrics.pendingReview || 0
  },
  approvedToday: {
    title: 'Approved Today',
    icon: 'CheckCircle',
    colorType: 'success',
    getValue: (metrics) => metrics.approvedToday || 0
  },
  totalAmount: {
    title: 'Total Amount',
    icon: 'AccountBalanceWallet',
    colorType: 'primary',
    prefix: 'K',
    getValue: (metrics) => metrics.totalAmount || 0
  },
  approvalRate: {
    title: 'Approval Rate',
    icon: 'Speed',
    colorType: 'info',
    suffix: '%',
    getValue: (metrics) => metrics.approvalRate || 0
  },
  disbursedToday: {
    title: 'Disbursed Today',
    icon: 'AttachMoney',
    colorType: 'info',
    getValue: (metrics) => metrics.disbursedToday || 0
  },
  pendingDisbursement: {
    title: 'Pending Disbursement',
    icon: 'Schedule',
    colorType: 'warning',
    getValue: (metrics) => metrics.pendingDisbursement || 0
  }
};

export const dashboardMetrics = {
  manager: ['pendingReview', 'approvedToday', 'totalAmount', 'approvalRate'],
  loanOfficer: ['pendingReview', 'approvedToday', 'totalAmount', 'approvalRate'],
  finance: ['pendingDisbursement', 'disbursedToday', 'totalAmount', 'approvalRate']
}; 