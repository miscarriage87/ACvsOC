import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Container, Grid, Paper, useTheme, TextField, Button } from '@mui/material';
import InfoBar from './InfoBar';
import ChatPanel from './ChatPanel';
import SessionControls from './SessionControls';
import MCPPanel from './MCPPanel';
import PluginPanel from './PluginPanel';

export default function AppLayout() {
  const theme = useTheme();
  
  // Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [maxIterations] = useState(8);
  const [totalTokens, setTotalTokens] = useState(0);
  
  // Model & Role State
  const [claudeModel, setClaudeModel] = useState('');
  const [gptModel, setGptModel] = useState('');
  const [claudeRole, setClaudeRole] = useState('');
  const [gptRole, setGptRole] = useState('');
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentTurn, setCurrentTurn] = useState(null); // 'claude' | 'gpt' | null
  
  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    let interval;
    if (sessionActive && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, sessionStartTime]);
  
  const startSession = () => {
    if (!claudeModel || !gptModel || !claudeRole || !gptRole || !userInput.trim()) {
      alert('Bitte wähle Modelle, Rollen und gib eine Aufgabe ein.');
      return;
    }
    setSessionActive(true);
    setSessionStartTime(Date.now());
    setCurrentIteration(1);
    setElapsedTime(0);
    setMessages([
      { id: 1, sender: 'user', content: userInput, timestamp: Date.now() }
    ]);
    setUserInput('');
    setCurrentTurn('claude');
    
    // Simulate Claude response after 2 seconds
    setTimeout(() => {
      const claudeResponse = `# Aufgabe verstanden\n\nIch arbeite als **${claudeRole}** an der Aufgabe: "${userInput}"\n\n\`\`\`javascript\n// Beispiel-Code\nfunction solve() {\n  return "Lösung in Arbeit...";\n}\n\`\`\`\n\n**STATUS: WORKING**`;
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'claude',
        content: claudeResponse,
        tokens: 156,
        timestamp: Date.now()
      }]);
      setTotalTokens(prev => prev + 156);
      setCurrentTurn('gpt');
      
      // Simulate GPT response after another 2 seconds
      setTimeout(() => {
        const gptResponse = `Als **${gptRole}** gebe ich folgendes Feedback:\n\n✅ **Positiv:**\n- Gute Struktur\n- Klare Kommentare\n\n⚠️ **Verbesserungen:**\n- Fehlerbehandlung hinzufügen\n- Tests implementieren\n\nBitte überarbeite den Code entsprechend.`;
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'gpt',
          content: gptResponse,
          tokens: 89,
          timestamp: Date.now()
        }]);
        setTotalTokens(prev => prev + 89);
        setCurrentTurn(null);
        setCurrentIteration(2);
      }, 2000);
    }, 2000);
  };
  
  const stopSession = () => {
    setSessionActive(false);
    setCurrentTurn(null);
  };
  
  const resetSession = () => {
    setSessionActive(false);
    setSessionStartTime(null);
    setCurrentIteration(0);
    setElapsedTime(0);
    setTotalTokens(0);
    setMessages([]);
    setCurrentTurn(null);
  };
  
  const exportSession = (format) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let content, filename, mimeType;
    
    if (format === 'json') {
      content = JSON.stringify({
        session: {
          startTime: sessionStartTime,
          duration: elapsedTime,
          iterations: currentIteration,
          totalTokens,
          models: { claude: claudeModel, gpt: gptModel },
          roles: { claude: claudeRole, gpt: gptRole }
        },
        messages
      }, null, 2);
      filename = `aicp-session-${timestamp}.json`;
      mimeType = 'application/json';
    } else if (format === 'markdown') {
      content = `# AI Collaboration Session\n\n**Datum:** ${new Date().toLocaleString()}\n**Dauer:** ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}\n**Tokens:** ${totalTokens}\n\n## Nachrichten\n\n${messages.map(m => `### ${m.sender === 'user' ? 'User' : m.sender === 'claude' ? 'Claude' : 'ChatGPT'}\n${m.content}\n${m.tokens ? `*${m.tokens} tokens*` : ''}\n`).join('\n')}`;
      filename = `aicp-session-${timestamp}.md`;
      mimeType = 'text/markdown';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const endSession = () => {
    exportSession('json');
    resetSession();
  };

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
        <InfoBar 
          sessionActive={sessionActive}
          totalTokens={totalTokens}
          elapsedTime={elapsedTime}
          currentIteration={currentIteration}
          maxIterations={maxIterations}
          onExport={exportSession}
          onEndSession={endSession}
        />
        
        {/* User Input */}
        {!sessionActive && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Beschreibe deine Programmieraufgabe..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Paper>
        )}
        
        {/* Main Area: Split Chat + Controls */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={5}>
            <ChatPanel 
              side="claude" 
              messages={messages.filter(m => m.sender === 'claude')}
              model={claudeModel}
              setModel={setClaudeModel}
              role={claudeRole}
              setRole={setClaudeRole}
              isActive={currentTurn === 'claude'}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Paper elevation={2} sx={{ p: 2, mb: 2, minHeight: 120 }}>
              <SessionControls 
                sessionActive={sessionActive}
                onStart={startSession}
                onStop={stopSession}
                onReset={resetSession}
              />
              <PluginPanel />
              <MCPPanel />
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <ChatPanel 
              side="gpt" 
              messages={messages.filter(m => m.sender === 'gpt')}
              model={gptModel}
              setModel={setGptModel}
              role={gptRole}
              setRole={setGptRole}
              isActive={currentTurn === 'gpt'}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 