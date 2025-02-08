import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  styled
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Schedule,
  ArrowForward,
  Block,
  AttachMoney,
  AccessTime,
  Done,
  ErrorOutline
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { colors } from '../../../theme/colors';

// Styled Components
const KanbanColumn = styled(Paper)(({ theme, color = colors.primary }) => ({
  padding: theme.spacing(2),
  background: alpha(color, 0.05),
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: `1px solid ${alpha(color, 0.1)}`,
  minHeight: '75vh',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 4px 20px ${alpha(color, 0.2)}`,
  },
  '& .MuiTypography-root': {
    color: colors.text.primary,
  }
}));

const LoanCard = styled(Paper)(({ theme, status }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  background: alpha(colors.card, 0.7),
  backdropFilter: 'blur(8px)',
  borderRadius: '12px',
  border: `1px solid ${alpha(colors.text.primary, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'grab',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 8px 24px ${alpha(colors.background, 0.3)}`,
  },
  '&:active': {
    cursor: 'grabbing',
    transform: 'scale(1.05)',
  }
}));

const StyledChip = styled(Chip)(({ color = colors.primary }) => ({
  backgroundColor: alpha(color, 0.1),
  color: color,
  borderRadius: '8px',
  '& .MuiChip-icon': {
    color: color,
  },
  '& .MuiChip-label': {
    fontWeight: 600,
  }
}));

const statusColors = {
  new: colors.warning,
  under_review: colors.info,
  manager_approved: colors.success,
  director_approved: colors.purple,
  disbursed: colors.success,
  rejected: colors.error,
  pending_funding: colors.warning,
  awaiting_funds: colors.warning
};

const statusIcons = {
  new: <AccessTime />,
  under_review: <Schedule />,
  manager_approved: <Done />,
  director_approved: <CheckCircle />,
  disbursed: <AttachMoney />,
  rejected: <ErrorOutline />,
  pending_funding: <Schedule />,
  awaiting_funds: <Warning />
};

const KanbanBoard = ({
  columns,
  loans,
  onLoanMove,
  onLoanClick,
  role,
  allowDrag = true
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination || !allowDrag) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      onLoanMove(draggableId, source.droppableId, destination.droppableId);
    }
  };

  const renderLoanCard = (loan, index) => (
    <Draggable
      key={loan.id}
      draggableId={loan.id}
      index={index}
      isDragDisabled={!allowDrag}
    >
      {(provided, snapshot) => (
        <LoanCard
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          status={loan.status}
          elevation={snapshot.isDragging ? 6 : 1}
          onClick={() => onLoanClick(loan)}
          sx={{
            transform: snapshot.isDragging ? 'scale(1.05)' : 'none',
            boxShadow: snapshot.isDragging 
              ? `0 12px 32px ${alpha(colors.background, 0.4)}`
              : 'none',
          }}
        >
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontSize: '1.1rem'
                }}
              >
                {loan.clientName || `${loan.personalDetails?.firstName} ${loan.personalDetails?.lastName}`}
              </Typography>
              <StyledChip
                size="small"
                icon={statusIcons[loan.status]}
                label={loan.status.replace(/_/g, ' ').toUpperCase()}
                color={statusColors[loan.status]}
              />
            </Box>
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.text.secondary,
                  fontSize: '0.95rem',
                  mb: 0.5
                }}
              >
                Amount: K{loan.amount?.toLocaleString() || loan.calculatedResults?.loanAmount?.toLocaleString()}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.text.secondary,
                  fontSize: '0.95rem'
                }}
              >
                Type: {loan.loanType}
              </Typography>
            </Box>
            {loan.status === 'rejected' && loan.rejectionReason && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.error,
                  bgcolor: alpha(colors.error, 0.1),
                  p: 1,
                  borderRadius: 1
                }}
              >
                Reason: {loan.rejectionReason}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {role === 'loan_officer' && loan.status === 'rejected' && (
                <Tooltip title="Resubmit" arrow>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: colors.primary,
                      '&:hover': {
                        bgcolor: alpha(colors.primary, 0.1)
                      }
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Stack>
        </LoanCard>
      )}
    </Draggable>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`, 
          gap: 3, 
          p: 3,
          bgcolor: alpha(colors.background, 0.3),
          borderRadius: '24px',
          backdropFilter: 'blur(12px)'
        }}
      >
        {columns.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided) => (
              <KanbanColumn
                color={column.color}
                ref={provided.innerRef}
                {...provided.droppableProps}
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
                      bgcolor: column.color,
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
              </KanbanColumn>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard; 