import React from 'react';
import { Box, CssBaseline, Container, Grid, Paper, useTheme } from '@mui/material';
import InfoBar from './InfoBar';
import ChatPanel from './ChatPanel';
import SessionControls from './SessionControls';
import MCPPanel from './MCPPanel';
import PluginPanel from './PluginPanel';

export default function AppLayout() {
  const theme = useTheme();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <span style={{ fontSize: 36, marginRight: 8 }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>AI Collaboration Platform</span>
        </Box>
        {/* InfoBar */}
        <InfoBar />
        {/* Main Area: Split Chat + Controls */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={5}>
            <ChatPanel side="claude" />
          </Grid>
          <Grid item xs={12} md={2}>
            <Paper elevation={2} sx={{ p: 2, mb: 2, minHeight: 120 }}>
              <SessionControls />
              <PluginPanel />
              <MCPPanel />
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <ChatPanel side="gpt" />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 