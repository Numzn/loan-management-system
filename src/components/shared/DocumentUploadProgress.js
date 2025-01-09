import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

export default function DocumentUploadProgress({ progress, fileName }) {
  const isComplete = progress === 100;
  const isUploading = progress > 0 && progress < 100;

  return (
    <Box sx={{ width: '100%', mr: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <LinearProgress 
            variant="determinate"
            value={progress} 
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor: isComplete ? 'success.main' : 'primary.main',
                transition: 'all 0.3s ease-out'
              }
            }}
          />
          {isUploading && (
            <LinearProgress
              variant="indeterminate"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 8,
                borderRadius: 1,
                opacity: 0.15,
                backgroundColor: 'transparent',
                '& .MuiLinearProgress-bar': {
                  animation: 'none',
                  backgroundImage: `linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.5),
                    transparent
                  )`,
                  transition: 'transform 0.4s ease'
                }
              }}
            />
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          minWidth: '60px',
          justifyContent: 'flex-end'
        }}>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(progress)}%`}
          </Typography>
          {isComplete && (
            <CheckIcon 
              color="success" 
              sx={{ 
                fontSize: 20,
                opacity: 0,
                animation: 'fadeIn 0.3s ease-out forwards'
              }} 
            />
          )}
        </Box>
      </Box>
      {fileName && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            mt: 0.5,
            display: 'block',
            fontStyle: isUploading ? 'italic' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          {isUploading ? `Uploading: ${fileName}` : 
           isComplete ? `Uploaded: ${fileName}` : fileName}
        </Typography>
      )}
    </Box>
  );
} 