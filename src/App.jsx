import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppLayout from './components/AppLayout';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#f43f5e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppLayout />
    </ThemeProvider>
  );
}

export default App; 