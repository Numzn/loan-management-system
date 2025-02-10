import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  useTheme
} from '@mui/material';
import {
  AccessTime,
  Done,
  AttachMoney,
  ErrorOutline,
  Warning,
  Schedule
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { alpha } from '@mui/material/styles';

const statusIcons = {
  new_review: <AccessTime />,
  approved: <Done />,
  disbursed: <AttachMoney />,
  rejected: <ErrorOutline />,
  pending_funding: <Schedule />,
  awaiting_funds: <Warning />
};

const getStatusColor = (status, theme) => {
  const colors = {
    new_review: theme.palette.warning,
    approved: theme.palette.success,
    disbursed: theme.palette.info,
    rejected: theme.palette.error,
    pending_funding: theme.palette.warning,
    awaiting_funds: theme.palette.warning
  };
  return colors[status] || theme.palette.primary;
};

const KanbanBoard = ({
  columns,
  loans,
  onLoanMove,
  onLoanClick,
  role,
  allowDrag = true
}) => {
  const theme = useTheme();

  const handleDragEnd = (result) => {
    if (!result.destination || !allowDrag) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      onLoanMove(draggableId, source.droppableId, destination.droppableId);
    }
  };

  const renderLoanCard = (loan, index) => {
    const statusColor = getStatusColor(loan.status, theme);

    return (
      <Draggable
        key={loan.id}
        draggableId={loan.id}
        index={index}
        isDragDisabled={!allowDrag}
      >
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            elevation={snapshot.isDragging ? 6 : 1}
            onClick={() => onLoanClick(loan)}
            sx={{
              p: 2.5,
              mb: 2,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${alpha(statusColor.main, 0.2)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'grab',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
              },
              '&:active': {
                cursor: 'grabbing',
                transform: 'scale(1.05)',
              }
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {loan.clientName}
                </Typography>
                <Chip
                  size="small"
                  icon={statusIcons[loan.status]}
                  label={loan.status.replace(/_/g, ' ').toUpperCase()}
                  sx={{
                    backgroundColor: alpha(statusColor.main, 0.1),
                    color: statusColor.main,
                    borderRadius: '8px',
                    '& .MuiChip-icon': {
                      color: 'inherit'
                    }
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Amount: K{loan.amount?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {loan.loanType}
                </Typography>
              </Box>
              {loan.status === 'rejected' && loan.rejectionReason && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  Reason: {loan.rejectionReason}
                </Typography>
              )}
            </Stack>
          </Paper>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`, 
          gap: 3, 
          p: 3,
          bgcolor: 'background.default',
          borderRadius: '24px',
        }}
      >
        {columns.map((column) => {
          const statusColor = getStatusColor(column.id, theme);
          
          return (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    p: 2,
                    background: alpha(theme.palette.background.paper, 0.05),
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: `1px solid ${alpha(statusColor.main, 0.1)}`,
                    minHeight: '75vh',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.2rem',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&::before': {
                        content: '""',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: statusColor.main,
                        display: 'inline-block'
                      }
                    }}
                  >
                    {column.title}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    {loans
                      .filter((loan) => loan.status === column.id)
                      .map((loan, index) => renderLoanCard(loan, index))}
                    {provided.placeholder}
                  </Box>
                </Paper>
              )}
            </Droppable>
          );
        })}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard; 