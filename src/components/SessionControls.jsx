import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import { PlayArrow, Stop, Refresh } from '@mui/icons-material';

export default function SessionControls({ sessionActive, onStart, onStop, onReset }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack spacing={1}>
        {!sessionActive ? (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PlayArrow />}
            onClick={onStart}
            fullWidth
          >
            Session starten
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<Stop />}
            onClick={onStop}
            fullWidth
          >
            Session stoppen
          </Button>
        )}
        
        <Button 
          variant="outlined" 
          startIcon={<Refresh />}
          onClick={onReset}
          fullWidth
          disabled={sessionActive}
        >
          Reset
        </Button>
      </Stack>
    </Box>
  );
} 