export default function LoadingOverlay({ loading, message }) {
  if (!loading) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress />
        {message && (
          <Typography sx={{ mt: 2 }}>{message}</Typography>
        )}
      </Box>
    </Box>
  );
} 