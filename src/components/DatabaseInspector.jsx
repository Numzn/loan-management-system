import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { inspectDatabase } from '../utils/supabaseClient';

const DatabaseInspector = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const inspectSchema = async () => {
      try {
        const result = await inspectDatabase();
        console.log('Database inspection result:', result);
        if (result.success) {
          setSchema(result);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    inspectSchema();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography>Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Your Database Tables
      </Typography>
      {schema?.tables && Object.entries(schema.tables).map(([tableName, columns]) => (
        <Accordion key={tableName}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {tableName}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {schema.errors[tableName] ? (
              <Typography color="error">
                Error: {schema.errors[tableName]}
              </Typography>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Columns:
                </Typography>
                <List dense>
                  {columns.map((column) => (
                    <ListItem key={column}>
                      <Typography variant="body2">
                        {column}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
                {schema.samples[tableName] && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Sample Data:
                    </Typography>
                    <Box component="pre" sx={{ 
                      p: 2, 
                      bgcolor: 'grey.100', 
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.875rem'
                    }}>
                      {JSON.stringify(schema.samples[tableName], null, 2)}
                    </Box>
                  </>
                )}
              </>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default DatabaseInspector; 