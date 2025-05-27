import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Container, Grid, Paper, useTheme, TextField } from '@mui/material';

// Simple placeholder components for now
const InfoBar = ({ sessionActive, totalTokens, elapsedTime, currentIteration, maxIterations, onExport, onEndSession }) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <div>Status: {sessionActive ? 'AKTIV' : 'BEREIT'} | Tokens: {totalTokens} | Zeit: {Math.floor(elapsedTime/60)}:{(elapsedTime%60).toString().padStart(2,'0')} | Iteration: {currentIteration}/{maxIterations}</div>
  </Paper>
);

const ChatPanel = ({ side, messages, model, setModel, role, setRole, isActive }) => (
  <Paper elevation={2} sx={{ height: '70vh', p: 2 }}>
    <h3>{side === 'claude' ? '🦙 Claude' : '🤖 ChatGPT'} {isActive && '(aktiv)'}</h3>
    <select value={model} onChange={(e) => setModel(e.target.value)} style={{width: '100%', marginBottom: 10}}>
      <option value="">Modell wählen...</option>
      {side === 'claude' ? (
        <>
          <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
          <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
        </>
      ) : (
        <>
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
        </>
      )}
    </select>
    <select value={role} onChange={(e) => setRole(e.target.value)} style={{width: '100%', marginBottom: 10}}>
      <option value="">Rolle wählen...</option>
      <option value="programmer">Programmer</option>
      <option value="reviewer">Code Reviewer</option>
      <option value="architect">Software Architect</option>
    </select>
    <div style={{height: '50vh', overflow: 'auto', border: '1px solid #ccc', padding: 10}}>
      {messages.length === 0 ? 'Warte auf Nachrichten...' : messages.map(msg => (
        <div key={msg.id} style={{marginBottom: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 5}}>
          <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          <div dangerouslySetInnerHTML={{__html: msg.content.replace(/\n/g, '<br>')}} />
          {msg.tokens && <small>({msg.tokens} tokens)</small>}
        </div>
      ))}
    </div>
  </Paper>
);

const SessionControls = ({ sessionActive, onStart, onStop, onReset }) => (
  <div style={{marginBottom: 20}}>
    {!sessionActive ? (
      <button onClick={onStart} style={{width: '100%', padding: 10, marginBottom: 5}}>▶ Session starten</button>
    ) : (
      <button onClick={onStop} style={{width: '100%', padding: 10, marginBottom: 5, backgroundColor: '#ff4444', color: 'white'}}>⏹ Session stoppen</button>
    )}
    <button onClick={onReset} disabled={sessionActive} style={{width: '100%', padding: 10}}>🔄 Reset</button>
  </div>
);

const PluginPanel = () => (
  <details style={{marginBottom: 10}}>
    <summary>🔧 Code Executor</summary>
    <div style={{padding: 10}}>
      <select style={{width: '100%', marginBottom: 5}}>
        <option>JavaScript</option>
        <option>Python</option>
      </select>
      <textarea placeholder="Code eingeben..." style={{width: '100%', height: 60}} />
      <button style={{width: '100%'}}>Ausführen</button>
    </div>
  </details>
);

const MCPPanel = () => (
  <details>
    <summary>🔌 MCP Tools</summary>
    <div style={{padding: 10}}>
      <button style={{width: '100%', marginBottom: 5}}>Verbinden</button>
      <div>Status: Getrennt</div>
    </div>
  </details>
);

export default function AppLayout() {
  const theme = useTheme();
  
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [maxIterations] = useState(8);
  const [totalTokens, setTotalTokens] = useState(0);
  
  const [claudeModel, setClaudeModel] = useState('');
  const [gptModel, setGptModel] = useState('');
  const [claudeRole, setClaudeRole] = useState('');
  const [gptRole, setGptRole] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentTurn, setCurrentTurn] = useState(null);
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
    setMessages([{ id: 1, sender: 'user', content: userInput, timestamp: Date.now() }]);
    setUserInput('');
    setCurrentTurn('claude');
    
    setTimeout(() => {
      const claudeResponse = `# Aufgabe verstanden\n\nIch arbeite als **${claudeRole}** an der Aufgabe: "${userInput}"\n\n**STATUS: WORKING**`;
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'claude',
        content: claudeResponse,
        tokens: 156,
        timestamp: Date.now()
      }]);
      setTotalTokens(prev => prev + 156);
      setCurrentTurn('gpt');
      
      setTimeout(() => {
        const gptResponse = `Als **${gptRole}** gebe ich folgendes Feedback:\n\n✅ **Positiv:** Gute Struktur\n⚠️ **Verbesserungen:** Tests hinzufügen`;
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
    const content = JSON.stringify({ messages, session: { totalTokens, elapsedTime } }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aicp-session-${timestamp}.json`;
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
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <span style={{ fontSize: 36, marginRight: 8 }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>AI Collaboration Platform</span>
        </Box>
        
        <InfoBar 
          sessionActive={sessionActive}
          totalTokens={totalTokens}
          elapsedTime={elapsedTime}
          currentIteration={currentIteration}
          maxIterations={maxIterations}
          onExport={exportSession}
          onEndSession={endSession}
        />
        
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