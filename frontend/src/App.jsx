import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { marked } from 'marked';
import './global.css';

// Import components
import InfoBar from './components/InfoBar';
import SessionControls from './components/SessionControls';
import ChatPanel from './components/ChatPanel';
import CodeExecutor from './components/CodeExecutor';
import MCPTools from './components/MCPTools';

const SOCKET_URL = '/';

const AiCollaborationPlatform = () => {
  // Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(8);
  const [totalTokens, setTotalTokens] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Model & Role State
  const [claudeModel, setClaudeModel] = useState('');
  const [gptModel, setGptModel] = useState('');
  const [claudeRole, setClaudeRole] = useState('');
  const [gptRole, setGptRole] = useState('');
  const [claudeModels, setClaudeModels] = useState([]);
  const [gptModels, setGptModels] = useState([]);
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentTurn, setCurrentTurn] = useState(null);
  const [statusBar, setStatusBar] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Code Executor State
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  // MCP State
  const [mcpConnected, setMcpConnected] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');

  // Socket.io
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // Scroll to bottom for chat
  const chatPanelRef = useRef(null);

  // Auto-run State
  const [autoRun, setAutoRun] = useState(true);
  const [waitingForContinue, setWaitingForContinue] = useState(false);

  // Load models on mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const [claudeRes, gptRes] = await Promise.all([
          fetch('/api/models/anthropic'),
          fetch('/api/models/openai'),
        ]);
        const claudeData = await claudeRes.json();
        const gptData = await gptRes.json();
        setClaudeModels(claudeData.models || []);
        setGptModels(gptData.models || []);
      } catch (e) {
        setStatusBar('Fehler beim Laden der Modelle.');
      }
    }
    fetchModels();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (sessionActive && sessionStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive, sessionStartTime]);

  // Socket.io setup
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    const socket = socketRef.current;

    socket.on('chat_message', (data) => {
      if (typeof data.tokens === 'number') {
        setTotalTokens((prev) => prev + data.tokens);
      }
      if (data.sender === 'system' && typeof data.message === 'string') {
        // Parse iteration/max from system message
        const iterMatch = data.message.match(/Iteration: (\d+) \/ (\d+)/);
        if (iterMatch) {
          setCurrentIteration(parseInt(iterMatch[1], 10));
          setMaxIterations(parseInt(iterMatch[2], 10));
        }
        if (data.message.match(/Collaboration started/)) {
          setSessionStartTime(Date.now());
          setElapsedTime(0);
        }
        if (data.message.match(/Collaboration session ended/)) {
          setCurrentTurn(null);
          setSessionActive(false);
        }
        if (data.message.match(/WAIT_FOR_CONTINUE/)) {
          setWaitingForContinue(true);
        } else {
          setWaitingForContinue(false);
        }
        setStatusBar(data.message);
      }
      if (data.sender === 'ai-claude') setCurrentTurn('claude');
      if (data.sender === 'ai-gpt') setCurrentTurn('gpt');
      setMessages((prev) => [...prev, {
        id: Date.now() + Math.random(),
        sender: data.sender,
        content: data.message,
        tokens: data.tokens,
        timestamp: Date.now(),
      }]);
      if (data.sender === 'ai-claude' || data.sender === 'ai-gpt') setLoading(false);
    });
    socket.on('error_message', (msg) => {
      setMessages((prev) => [...prev, {
        id: Date.now() + Math.random(),
        sender: 'system',
        content: msg,
        timestamp: Date.now(),
      }]);
      setLoading(false);
      setStatusBar(msg);
    });
    return () => {
      socket.off('chat_message');
      socket.off('error_message');
    };
  }, []);
  
  // Session Management
  const startSession = () => {
    if (!claudeModel || !gptModel || !userInput.trim()) {
      alert('⚠️ Bitte wähle Modelle, Rollen und gib eine Aufgabe ein!');
      return;
    }
    setSessionActive(true);
    setSessionStartTime(Date.now());
    setCurrentIteration(1);
    setElapsedTime(0);
    setMessages([{ 
      id: Date.now(), 
      sender: 'user', 
      content: userInput, 
      timestamp: Date.now() 
    }]);
    const taskWithRoles = `${userInput}\n\nClaude-Rolle: ${claudeRole}\nChatGPT-Rolle: ${gptRole}`;
    setUserInput('');
    setCurrentTurn('claude');
    setTotalTokens(0);
    setStatusBar('Collaboration started...');
    setLoading(true);
    setWaitingForContinue(false);
    socketRef.current.emit('start_task', {
      taskDescription: taskWithRoles,
      claudeModel,
      openaiModel: gptModel,
      autoRun
    });
  };
  
  const stopSession = () => {
    setSessionActive(false);
    setCurrentTurn(null);
    setLoading(false);
    socketRef.current.emit('stop_task');
  };
  
  const resetSession = () => {
    setSessionActive(false);
    setSessionStartTime(null);
    setCurrentIteration(0);
    setElapsedTime(0);
    setTotalTokens(0);
    setMessages([]);
    setCurrentTurn(null);
    setUserInput('');
    setStatusBar('');
    setLoading(false);
  };

  // Code Execution
  const executeCode = async () => {
    setIsRunning(true);
    setCodeOutput('🔄 Ausführung gestartet...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (codeLanguage === 'javascript') {
        try {
          // eslint-disable-next-line no-eval
          const result = eval(code);
          setCodeOutput(`✅ Ergebnis:\n${JSON.stringify(result, null, 2)}`);
        } catch (error) {
          setCodeOutput(`❌ JavaScript Fehler:\n${error.message}`);
        }
      } else if (codeLanguage === 'python') {
        setCodeOutput(`🐍 Python Simulation:\n# Ihr Code:\n${code}\n\n# Ausgabe:\nHello from Python!\nCode würde hier ausgeführt werden.`);
      } else if (codeLanguage === 'shell') {
        setCodeOutput(`💻 Shell Simulation:\n$ ${code}\n\nBefehl würde hier ausgeführt werden.\nExit code: 0`);
      }
    } catch (error) {
      setCodeOutput(`❌ Ausführungsfehler:\n${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // MCP Tool Execution
  const executeTool = () => {
    if (!selectedTool || !toolInput.trim()) return;
    
    const tools = {
      'file_search': '📁 File Search',
      'web_search': '🌐 Web Search', 
      'database': '🗄️ Database Query',
      'api_call': '🔗 API Call'
    };
    
    const toolName = tools[selectedTool];
    setToolOutput(`🔧 Tool "${toolName}" ausgeführt\n\n📥 Input: "${toolInput}"\n\n📤 Simuliertes Ergebnis:\n✅ Status: Erfolgreich\n📊 Daten: [Beispiel-Daten gefunden]\n⏱️ Ausführungszeit: 0.8s`);
  };

  // Session Export
  const exportSession = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionData = {
      metadata: {
        exportTime: new Date().toISOString(),
        platform: 'AI Collaboration Platform v1.0',
        sessionId: `session-${timestamp}`
      },
      session: {
        startTime: sessionStartTime,
        duration: elapsedTime,
        iterations: currentIteration,
        totalTokens,
        models: { claude: claudeModel, gpt: gptModel },
        roles: { claude: claudeRole, gpt: gptRole }
      },
      messages,
      statistics: {
        claudeMessages: messages.filter(m => m.sender === 'ai-claude').length,
        gptMessages: messages.filter(m => m.sender === 'ai-gpt').length,
        averageTokensPerMessage: Math.round(totalTokens / Math.max(messages.length - 1, 1))
      }
    };
    
    const content = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aicp-session-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Utility Functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessage = (msg) => {
    let content = msg.content;
    // Remove prefixes like [Claude] or [ChatGPT] if they exist
    content = content.replace(/^\[(Claude|ChatGPT)\]\s*\(\d+s\):\s*\n?/i, '');
    
    if (msg.sender === 'ai-claude' || msg.sender === 'ai-gpt') {
      return marked.parse(content || '');
    } else {
      return content.replace(/\n/g, '<br>');
    }
  };

  const handleContinue = () => {
    setWaitingForContinue(false);
    socketRef.current.emit('continue_round');
  };

  return (
    <div className="app-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🤖 AI Collaboration</h2>
        </div>
        <div className="sidebar-section">
          <SessionControls 
            sessionActive={sessionActive}
            onStart={startSession}
            onStop={stopSession}
            onReset={resetSession}
          />
          <div style={{marginTop: '1.5rem'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.7rem', fontWeight: 600, color: '#f3f4f6'}}>
              <input type="checkbox" checked={autoRun} onChange={e => setAutoRun(e.target.checked)} disabled={sessionActive} />
              Auto-run
            </label>
          </div>
        </div>
        <div className="sidebar-footer">
          <button className="export-btn" onClick={exportSession}>📥 Export JSON</button>
        </div>
      </aside>
      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <h1>AI Collaboration Platform</h1>
        </header>
        <section className="chat-messages" ref={chatPanelRef}>
          {messages.filter(msg => msg.sender !== 'system').length === 0 ? (
            <div className="chat-empty">Starte eine Session, um loszulegen!</div>
          ) : (
            messages.filter(msg => msg.sender !== 'system').map(msg => (
              <div key={msg.id} className={`chat-message chat-message-${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === 'user' ? '🧑' : msg.sender === 'ai-claude' ? '🦙' : msg.sender === 'ai-gpt' ? '🤖' : '💡'}
                </div>
                <div className="chat-bubble">
                  <div className="chat-meta">
                    <span className="chat-sender">{msg.sender === 'user' ? 'Du' : msg.sender === 'ai-claude' ? 'Claude' : msg.sender === 'ai-gpt' ? 'ChatGPT' : 'System'}</span>
                    <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    {msg.tokens && <span className="chat-tokens">{msg.tokens} tokens</span>}
                  </div>
                  <div className="chat-content" dangerouslySetInnerHTML={{__html: renderMessage(msg)}} />
                </div>
              </div>
            ))
          )}
        </section>
        {/* Token-Zeile unter dem Chat */}
        <div className="chat-token-bar">
          TOTAL TOKENS USED: {totalTokens.toLocaleString()}
        </div>
        {/* Persistent Input Bar */}
        <form className="chat-input-bar" onSubmit={e => { e.preventDefault(); startSession(); }}>
          <textarea
            className="chat-input"
            placeholder="Beschreibe deine Aufgabe oder stelle eine Frage..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            disabled={sessionActive}
          />
          <div className="chat-input-actions">
            <select
              className="model-select"
              value={claudeModel}
              onChange={e => setClaudeModel(e.target.value)}
              disabled={sessionActive}
            >
              <option value="">claude-sonnet-4-20250514</option>
              {claudeModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              className="model-select"
              value={gptModel}
              onChange={e => setGptModel(e.target.value)}
              disabled={sessionActive}
            >
              <option value="">gpt-4o</option>
              {gptModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button className="send-btn" type="submit" disabled={sessionActive || !userInput.trim()}>Senden</button>
          </div>
        </form>
        {/* Weiter-Button bei autoRun=OFF und Warten auf Nutzer */}
        {!autoRun && waitingForContinue && (
          <div style={{textAlign: 'center', margin: '1.5rem 0'}}>
            <button className="send-btn" onClick={handleContinue} style={{fontSize: '1.1rem', padding: '1rem 2.5rem'}}>
              ▶️ Weiter
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AiCollaborationPlatform;
