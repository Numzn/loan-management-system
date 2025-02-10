import React from 'react';
import { Grid } from '@mui/material';
import MetricCard from './MetricCard';
import { metricCardTypes } from '../../theme/dashboardStyles';
import * as Icons from '@mui/icons-material';

const DashboardMetrics = ({ metrics, metricTypes }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {metricTypes.map((type) => {
        const config = metricCardTypes[type];
        const IconComponent = Icons[config.icon];
        
        return (
          <Grid item xs={12} sm={6} md={3} key={type}>
            <MetricCard
              title={config.title}
              value={config.getValue(metrics)}
              icon={<IconComponent />}
              colorType={config.colorType}
              prefix={config.prefix}
              suffix={config.suffix}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default DashboardMetrics; 