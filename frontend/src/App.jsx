import { useState, useEffect, useRef } from 'react';
import { 
  ThemeProvider, createTheme, 
  CssBaseline, Box, Container, Typography, 
  TextField, Button, Paper, IconButton, 
  Card, CardContent, FormControl, 
  InputLabel, Select, MenuItem, 
  Divider, CircularProgress, 
  Snackbar, Alert, Switch, FormControlLabel,
  Tooltip, Menu, Fade, ListItemIcon, ListItemText,
  List, ListItem, LinearProgress
} from '@mui/material';
import { 
  DarkMode, LightMode, Send, Stop, 
  MoreVert, Download, ContentCopy, 
  Refresh, Psychology, SmartToy, Person,
  Science, BarChart, Timer, Repeat, Settings
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { marked } from 'marked';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Configure marked to use syntax highlighting for code blocks
marked.setOptions({
  highlight: (code, lang) => {
    return SyntaxHighlighter.highlight(code, {
      language: lang || 'javascript',
      style: vscDarkPlus
    });
  }
});

// Create theme with dark and light mode
const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#6366f1' : '#4f46e5',
      light: '#818cf8',
      dark: '#4338ca',
    },
    secondary: {
      main: mode === 'dark' ? '#f43f5e' : '#e11d48',
      light: '#fb7185',
      dark: '#be123c',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
    },
    claude: {
      main: '#6366f1',
      light: '#818cf8',
      contrastText: '#ffffff',
    },
    chatgpt: {
      main: '#f43f5e',
      light: '#fb7185',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.00833em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          borderRadius: 16,
          boxShadow: mode === 'dark'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.05)' 
            : '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 20px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #6366f1 60%, #4f46e5 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #f43f5e 60%, #e11d48 100%)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true' || false);
  const theme = createAppTheme(darkMode ? 'dark' : 'light');
  
  // Socket connection
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  
  // Model selection
  const [claudeModels, setClaudeModels] = useState([]);
  const [openaiModels, setOpenaiModels] = useState([]);
  const [selectedClaudeModel, setSelectedClaudeModel] = useState('');
  const [selectedOpenaiModel, setSelectedOpenaiModel] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(8);
  const [sessionTime, setSessionTime] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [error, setError] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  
  // Refs
  const chatContainerRef = useRef(null);
  const timerRef = useRef(null);
  
  // Theme toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };
  
  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(window.location.hostname === 'localhost' 
      ? `http://localhost:${window.location.port || 3000}`
      : window.location.origin
    );
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });
    
    socketRef.current.on('chat_message', handleChatMessage);
    socketRef.current.on('error_message', handleErrorMessage);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const [claudeRes, openaiRes] = await Promise.all([
          fetch('/api/models/anthropic'),
          fetch('/api/models/openai'),
        ]);
        
        const claudeData = await claudeRes.json();
        const openaiData = await openaiRes.json();
        
        setClaudeModels(claudeData.models || []);
        setOpenaiModels(openaiData.models || []);
        
        // Set default selections
        if (claudeData.models && claudeData.models.length > 0) {
          setSelectedClaudeModel(claudeData.models[0]);
        }
        if (openaiData.models && openaiData.models.length > 0) {
          setSelectedOpenaiModel(openaiData.models[0]);
        }
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load AI models. Please refresh the page.');
      } finally {
        setLoadingModels(false);
      }
    };
    
    if (connected) {
      loadModels();
    }
  }, [connected]);
  
  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Session timer
  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionActive]);
  
  // Handle chat messages from server
  const handleChatMessage = (data) => {
    if (data.sender === 'system') {
      // Parse system messages for metadata
      if (typeof data.message === 'string') {
        // Check for iteration info
        const iterMatch = data.message.match(/Iteration: (\d+) \/ (\d+)/);
        if (iterMatch) {
          setCurrentIteration(parseInt(iterMatch[1], 10));
          setMaxIterations(parseInt(iterMatch[2], 10));
        }
        
        // Check for session status
        if (data.message.includes('Collaboration started')) {
          setSessionActive(true);
          setSessionTime(0);
        }
        
        if (data.message.includes('Collaboration session ended') || 
            data.message.includes('Collaboration stopped')) {
          setSessionActive(false);
          setCurrentTurn(null);
        }
        
        // Check for token info
        if (data.message.includes('Total tokens used:')) {
          const tokenMatch = data.message.match(/Total tokens used: (\d+)/);
          if (tokenMatch) {
            setTotalTokens(parseInt(tokenMatch[1], 10));
          }
        }
      }
    }
    
    // Set current turn
    if (data.sender === 'ai-claude') setCurrentTurn('claude');
    if (data.sender === 'ai-gpt') setCurrentTurn('chatgpt');
    
    // Add tokens from message
    if (typeof data.tokens === 'number') {
      setTotalTokens(prev => prev + data.tokens);
    }
    
    // Add message to chat
    setMessages(prev => [...prev, data]);
  };
  
  // Handle error messages
  const handleErrorMessage = (message) => {
    setError(message);
    setMessages(prev => [
      ...prev, 
      { sender: 'system', message, error: true }
    ]);
  };
  
  // Start task
  const handleStartTask = (e) => {
    e.preventDefault();
    if (!taskInput.trim() || !selectedClaudeModel || !selectedOpenaiModel) {
      setError('Please enter a task and select models for both AIs.');
      return;
    }
    
    setMessages([
      { sender: 'user', message: taskInput }
    ]);
    
    socketRef.current.emit('start_task', {
      taskDescription: taskInput,
      claudeModel: selectedClaudeModel,
      openaiModel: selectedOpenaiModel,
      autoRun: true
    });
    
    setSessionActive(true);
    setCurrentIteration(0);
    setSessionTime(0);
    setTotalTokens(0);
    setError(null);
  };
  
  // Stop task
  const handleStopTask = () => {
    socketRef.current.emit('stop_task');
  };
  
  // Export conversation
  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };
  
  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };
  
  const exportAsMarkdown = () => {
    const markdown = messages
      .map(msg => {
        let sender = '';
        switch (msg.sender) {
          case 'user': sender = '👤 User'; break;
          case 'ai-claude': sender = '🦙 Claude'; break;
          case 'ai-gpt': sender = '🤖 ChatGPT'; break;
          case 'system': sender = '⚙️ System'; break;
          default: sender = msg.sender;
        }
        return `## ${sender}\n\n${msg.message}\n\n---\n`;
      })
      .join('\n');
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-collaboration-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    handleExportClose();
  };
  
  const exportAsJSON = () => {
    const json = JSON.stringify(messages, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-collaboration-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    handleExportClose();
  };
  
  const copyToClipboard = () => {
    const text = messages
      .map(msg => {
        let sender = '';
        switch (msg.sender) {
          case 'user': sender = 'User'; break;
          case 'ai-claude': sender = 'Claude'; break;
          case 'ai-gpt': sender = 'ChatGPT'; break;
          case 'system': sender = 'System'; break;
          default: sender = msg.sender;
        }
        return `${sender}: ${msg.message}`;
      })
      .join('\n\n');
    
    navigator.clipboard.writeText(text);
    handleExportClose();
    setError('Conversation copied to clipboard!');
  };
  
  // Render message content with markdown
  const renderMessageContent = (message) => {
    if (typeof message !== 'string') {
      return <pre>{JSON.stringify(message, null, 2)}</pre>;
    }
    
    // Create HTML from markdown
    const html = marked.parse(message);
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: html }} 
        className="markdown-content"
      />
    );
  };
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
            : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          transition: 'background 0.5s ease',
          pb: 4
        }}
      >
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            py: 2,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.8)' 
              : 'rgba(255, 255, 255, 0.8)',
            borderBottom: '1px solid',
            borderColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Science 
              sx={{ 
                fontSize: 32, 
                mr: 1.5, 
                background: 'linear-gradient(45deg, #6366f1, #f43f5e)',
                borderRadius: '50%',
                p: 0.5,
                color: 'white'
              }} 
            />
            <Typography variant="h5" component="h1" fontWeight="700">
              AI Collaboration Platform
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {connected ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'success.main',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main',
                    mr: 1
                  }} 
                />
                Connected
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'error.main',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'error.main',
                    mr: 1
                  }} 
                />
                Disconnected
              </Box>
            )}
            
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {/* Model Selection */}
          <Box
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{ mb: 4 }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Claude Model Card */}
              <Card 
                sx={{ 
                  flex: 1,
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background: 'linear-gradient(45deg, #6366f1, #818cf8)',
                    zIndex: -1,
                    borderRadius: '18px',
                    opacity: 0.6,
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      component="span"
                      sx={{
                        fontSize: '1.5rem',
                        mr: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #6366f1, #818cf8)',
                        color: 'white'
                      }}
                    >
                      🦙
                    </Box>
                    <Typography variant="h6" component="h2">
                      Claude (Anthropic)
                    </Typography>
                  </Box>
                  
                  <FormControl fullWidth disabled={sessionActive || loadingModels}>
                    <InputLabel id="claude-model-label">Select Model</InputLabel>
                    <Select
                      labelId="claude-model-label"
                      id="claude-model-select"
                      value={selectedClaudeModel}
                      onChange={(e) => setSelectedClaudeModel(e.target.value)}
                      label="Select Model"
                    >
                      {loadingModels ? (
                        <MenuItem value="">
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading models...
                        </MenuItem>
                      ) : claudeModels.length === 0 ? (
                        <MenuItem value="">No models available</MenuItem>
                      ) : (
                        claudeModels.map((model) => (
                          <MenuItem key={model} value={model}>
                            {model}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Role: Programmer
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              {/* ChatGPT Model Card */}
              <Card 
                sx={{ 
                  flex: 1,
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background: 'linear-gradient(45deg, #f43f5e, #fb7185)',
                    zIndex: -1,
                    borderRadius: '18px',
                    opacity: 0.6,
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      component="span"
                      sx={{
                        fontSize: '1.5rem',
                        mr: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #f43f5e, #fb7185)',
                        color: 'white'
                      }}
                    >
                      🤖
                    </Box>
                    <Typography variant="h6" component="h2">
                      ChatGPT (OpenAI)
                    </Typography>
                  </Box>
                  
                  <FormControl fullWidth disabled={sessionActive || loadingModels}>
                    <InputLabel id="openai-model-label">Select Model</InputLabel>
                    <Select
                      labelId="openai-model-label"
                      id="openai-model-select"
                      value={selectedOpenaiModel}
                      onChange={(e) => setSelectedOpenaiModel(e.target.value)}
                      label="Select Model"
                    >
                      {loadingModels ? (
                        <MenuItem value="">
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading models...
                        </MenuItem>
                      ) : openaiModels.length === 0 ? (
                        <MenuItem value="">No models available</MenuItem>
                      ) : (
                        openaiModels.map((model) => (
                          <MenuItem key={model} value={model}>
                            {model}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <SmartToy sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Role: Reviewer
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
          
          {/* Task Input */}
          <Box
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ mb: 4 }}
          >
            <Card>
              <CardContent>
                <form onSubmit={handleStartTask}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Describe your programming task..."
                      variant="outlined"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      disabled={sessionActive}
                      placeholder="E.g., Create a React component that displays a list of items with pagination"
                      InputProps={{
                        sx: { pr: 1 }
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!connected || sessionActive || !taskInput.trim()}
                        startIcon={<Send />}
                        sx={{ minWidth: '120px' }}
                      >
                        Start
                      </Button>
                      
                      <Button
                        type="button"
                        variant="contained"
                        color="secondary"
                        disabled={!connected || !sessionActive}
                        startIcon={<Stop />}
                        onClick={handleStopTask}
                        sx={{ minWidth: '120px' }}
                      >
                        Stop
                      </Button>
                    </Box>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Box>
          
          {/* Status Bar */}
          <Box
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            sx={{ mb: 2 }}
          >
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 }, justifyContent: 'space-between' }}>
                  {/* Session Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: sessionActive ? 'success.main' : 'text.disabled',
                        mr: 1,
                        animation: sessionActive ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                          '100%': { opacity: 1 }
                        }
                      }} 
                    />
                    <Typography variant="body2" fontWeight={500}>
                      Status: {sessionActive ? 'Active' : 'Idle'}
                    </Typography>
                  </Box>
                  
                  {/* Current Turn */}
                  {currentTurn && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: currentTurn === 'claude' 
                            ? 'linear-gradient(45deg, #6366f1, #818cf8)'
                            : 'linear-gradient(45deg, #f43f5e, #fb7185)',
                          color: 'white',
                          mr: 1,
                          fontSize: '0.875rem'
                        }}
                      >
                        {currentTurn === 'claude' ? '🦙' : '🤖'}
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        Turn: {currentTurn === 'claude' ? 'Claude' : 'ChatGPT'}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Iteration Counter */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Repeat sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                    <Typography variant="body2" fontWeight={500}>
                      Iteration: {currentIteration}/{maxIterations}
                    </Typography>
                  </Box>
                  
                  {/* Session Timer */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timer sx={{ fontSize: 20, mr: 1, color: 'warning.main' }} />
                    <Typography variant="body2" fontWeight={500}>
                      Time: {formatTime(sessionTime)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          {/* Token Counter */}
          <Box
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            sx={{ mb: 4 }}
          >
            <Card>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BarChart sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" fontWeight={500}>
                    Total Tokens: {totalTokens}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((totalTokens / 10000) * 100, 100)} 
                  color={totalTokens > 8000 ? "error" : totalTokens > 5000 ? "warning" : "primary"}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }}
                />
              </CardContent>
            </Card>
          </Box>
          
          {/* Chat Area */}
          <Box
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card 
              sx={{ 
                minHeight: 400, 
                maxHeight: 600,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <CardContent sx={{ p: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Conversation
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Export Conversation">
                      <IconButton onClick={handleExportClick}>
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                    
                    <Menu
                      anchorEl={exportMenuAnchor}
                      open={Boolean(exportMenuAnchor)}
                      onClose={handleExportClose}
                      TransitionComponent={Fade}
                    >
                      <MenuItem onClick={exportAsMarkdown}>
                        <ListItemIcon>
                          <Download fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Export as Markdown</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={exportAsJSON}>
                        <ListItemIcon>
                          <Download fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Export as JSON</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={copyToClipboard}>
                        <ListItemIcon>
                          <ContentCopy fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy to Clipboard</ListItemText>
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
                
                {/* Messages */}
                <Box 
                  ref={chatContainerRef}
                  sx={{ 
                    p: 2, 
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <AnimatePresence>
                    {messages.length === 0 ? (
                      <Box 
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          justifyContent: 'center',
                          height: '100%',
                          textAlign: 'center',
                          p: 4
                        }}
                      >
                        <Science sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Conversation Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Select AI models and enter a programming task to start a collaboration session.
                        </Typography>
                      </Box>
                    ) : (
                      messages.map((msg, index) => {
                        let icon = null;
                        let color = null;
                        let align = 'flex-start';
                        let bgGradient = null;
                        
                        switch (msg.sender) {
                          case 'user':
                            icon = <Person />;
                            color = 'text.primary';
                            align = 'flex-end';
                            bgGradient = theme.palette.mode === 'dark'
                              ? 'linear-gradient(45deg, rgba(253, 224, 71, 0.15), rgba(250, 204, 21, 0.15))'
                              : 'linear-gradient(45deg, rgba(253, 224, 71, 0.3), rgba(250, 204, 21, 0.3))';
                            break;
                          case 'ai-claude':
                            icon = <Box component="span" sx={{ fontSize: '1.2rem' }}>🦙</Box>;
                            color = 'primary.main';
                            bgGradient = theme.palette.mode === 'dark'
                              ? 'linear-gradient(45deg, rgba(99, 102, 241, 0.15), rgba(129, 140, 248, 0.15))'
                              : 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.1))';
                            break;
                          case 'ai-gpt':
                            icon = <Box component="span" sx={{ fontSize: '1.2rem' }}>🤖</Box>;
                            color = 'secondary.main';
                            bgGradient = theme.palette.mode === 'dark'
                              ? 'linear-gradient(45deg, rgba(244, 63, 94, 0.15), rgba(251, 113, 133, 0.15))'
                              : 'linear-gradient(45deg, rgba(244, 63, 94, 0.1), rgba(251, 113, 133, 0.1))';
                            break;
                          case 'system':
                            icon = <Settings />;
                            color = msg.error ? 'error.main' : 'text.secondary';
                            bgGradient = theme.palette.mode === 'dark'
                              ? 'linear-gradient(45deg, rgba(100, 116, 139, 0.2), rgba(71, 85, 105, 0.2))'
                              : 'linear-gradient(45deg, rgba(241, 245, 249, 0.9), rgba(226, 232, 240, 0.9))';
                            break;
                          default:
                            icon = <Box component="span" sx={{ fontSize: '1.2rem' }}>❓</Box>;
                        }
                        
                        return (
                          <Box
                            component={motion.div}
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: align,
                              maxWidth: '85%',
                              alignSelf: align
                            }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                background: bgGradient,
                                borderRadius: '16px',
                                borderTopLeftRadius: msg.sender !== 'user' ? '4px' : '16px',
                                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                border: '1px solid',
                                borderColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.1)' 
                                  : 'rgba(0, 0, 0, 0.05)',
                              }}
                            >
                              {/* Message Header */}
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 1,
                                color: color
                              }}>
                                <Box 
                                  sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.mode === 'dark' 
                                      ? 'rgba(255, 255, 255, 0.1)' 
                                      : 'rgba(0, 0, 0, 0.05)',
                                    mr: 1
                                  }}
                                >
                                  {icon}
                                </Box>
                                
                                <Typography 
                                  variant="body2" 
                                  fontWeight={600}
                                  color={color}
                                >
                                  {msg.sender === 'user' ? 'You' : 
                                   msg.sender === 'ai-claude' ? 'Claude' : 
                                   msg.sender === 'ai-gpt' ? 'ChatGPT' : 'System'}
                                </Typography>
                                
                                {msg.tokens && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ ml: 1, opacity: 0.7 }}
                                  >
                                    · {msg.tokens} tokens
                                  </Typography>
                                )}
                              </Box>
                              
                              {/* Message Content */}
                              <Box 
                                sx={{ 
                                  ml: 0.5,
                                  '& .markdown-content': {
                                    '& pre': {
                                      borderRadius: 2,
                                      p: 2,
                                      overflowX: 'auto',
                                      backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(0, 0, 0, 0.3)' 
                                        : 'rgba(0, 0, 0, 0.03)',
                                    },
                                    '& code': {
                                      fontFamily: 'monospace',
                                      backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(0, 0, 0, 0.3)' 
                                        : 'rgba(0, 0, 0, 0.03)',
                                      padding: '2px 4px',
                                      borderRadius: 1,
                                    },
                                    '& a': {
                                      color: 'primary.main',
                                      textDecoration: 'none',
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
                                    },
                                    '& img': {
                                      maxWidth: '100%',
                                      borderRadius: 1,
                                    },
                                    '& table': {
                                      borderCollapse: 'collapse',
                                      width: '100%',
                                      marginBottom: 2,
                                    },
                                    '& th, & td': {
                                      border: '1px solid',
                                      borderColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.1)',
                                      padding: 1,
                                    },
                                    '& th': {
                                      backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.05)' 
                                        : 'rgba(0, 0, 0, 0.03)',
                                    },
                                  }
                                }}
                              >
                                {renderMessageContent(msg.message)}
                              </Box>
                            </Paper>
                          </Box>
                        );
                      })
                    )}
                  </AnimatePresence>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
      
      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity={error && error.includes('copied') ? 'success' : 'error'} 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
