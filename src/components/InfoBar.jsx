import React from 'react';
import { Paper, Box, Chip, Button, ButtonGroup, Typography } from '@mui/material';
import { PlayArrow, Stop, GetApp, FileDownload } from '@mui/icons-material';

export default function InfoBar({ 
  sessionActive, 
  totalTokens, 
  elapsedTime, 
  currentIteration, 
  maxIterations,
  onExport,
  onEndSession 
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {/* Status */}
      <Chip 
        icon={sessionActive ? <PlayArrow /> : <Stop />}
        label={sessionActive ? 'AKTIV' : 'BEREIT'}
        color={sessionActive ? 'success' : 'default'}
        variant={sessionActive ? 'filled' : 'outlined'}
      />
      
      {/* Tokens */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">Tokens:</Typography>
        <Chip label={totalTokens.toLocaleString()} size="small" />
      </Box>
      
      {/* Time */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">Zeit:</Typography>
        <Chip label={formatTime(elapsedTime)} size="small" />
      </Box>
      
      {/* Iterations */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">Iteration:</Typography>
        <Chip 
          label={`${currentIteration}/${maxIterations}`} 
          size="small"
          color={currentIteration >= maxIterations ? 'warning' : 'default'}
        />
      </Box>
      
      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Export Buttons */}
      {sessionActive && (
        <ButtonGroup size="small" variant="outlined">
          <Button 
            startIcon={<FileDownload />}
            onClick={() => onExport('markdown')}
          >
            MD
          </Button>
          <Button 
            startIcon={<GetApp />}
            onClick={() => onExport('json')}
          >
            JSON
          </Button>
          <Button 
            color="error"
            onClick={onEndSession}
          >
            Ende
          </Button>
        </ButtonGroup>
      )}
    </Paper>
  );
} 