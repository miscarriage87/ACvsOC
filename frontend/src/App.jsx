import React, { useState, useEffect } from 'react';

const AiCollaborationPlatform = () => {
  // Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Model & Role State
  const [claudeModel, setClaudeModel] = useState('');
  const [gptModel, setGptModel] = useState('');
  const [claudeRole, setClaudeRole] = useState('');
  const [gptRole, setGptRole] = useState('');
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentTurn, setCurrentTurn] = useState(null);
  
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

  // Timer Effect
  useEffect(() => {
    let interval;
    if (sessionActive && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, sessionStartTime]);
  
  // Session Management
  const startSession = () => {
    if (!claudeModel || !gptModel || !claudeRole || !gptRole || !userInput.trim()) {
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
    setUserInput('');
    setCurrentTurn('claude');
    
    // Simulate Claude response
    setTimeout(() => {
      const claudeResponse = `# 🎯 Aufgabe verstanden!\n\nIch arbeite als **${claudeRole}** an der Aufgabe:\n> "${userInput}"\n\n## 💡 Mein Ansatz:\n\`\`\`javascript\nfunction solveProblem() {\n  // Analysiere die Anforderungen\n  const requirements = parseRequirements();\n  \n  // Entwickle Lösung\n  const solution = createSolution(requirements);\n  \n  return solution;\n}\n\`\`\`\n\n**🔄 STATUS: WORKING...**`;
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'claude',
        content: claudeResponse,
        tokens: 187,
        timestamp: Date.now()
      }]);
      setTotalTokens(prev => prev + 187);
      setCurrentTurn('gpt');
      
      // Simulate GPT response
      setTimeout(() => {
        const gptResponse = `## 🔍 Code Review als **${gptRole}**\n\n### ✅ **Positive Aspekte:**\n- Klare Funktionsstruktur\n- Gute Namensgebung\n- Modularer Aufbau\n\n### ⚠️ **Verbesserungsvorschläge:**\n- **Fehlerbehandlung:** Try-catch Blöcke hinzufügen\n- **Validierung:** Input-Parameter prüfen\n- **Tests:** Unit Tests implementieren\n- **Dokumentation:** JSDoc Kommentare\n\n### 🚀 **Nächste Schritte:**\n1. Fehlerbehandlung implementieren\n2. Validierungslogik hinzufügen\n3. Test-Suite erstellen\n\n**💬 Bitte überarbeite den Code entsprechend!**`;
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'gpt',
          content: gptResponse,
          tokens: 143,
          timestamp: Date.now()
        }]);
        setTotalTokens(prev => prev + 143);
        setCurrentTurn(null);
        setCurrentIteration(2);
      }, 2500);
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
    setUserInput('');
  };

  // Code Execution
  const executeCode = async () => {
    setIsRunning(true);
    setCodeOutput('🔄 Ausführung gestartet...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (codeLanguage === 'javascript') {
        try {
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
        claudeMessages: messages.filter(m => m.sender === 'claude').length,
        gptMessages: messages.filter(m => m.sender === 'gpt').length,
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
    let html = msg.content;
    // Enhanced markdown rendering
    html = html.replace(/### (.*?)$/gm, '<h3 style="color: #1f2937; margin: 15px 0 10px 0; font-size: 16px;">$1</h3>');
    html = html.replace(/## (.*?)$/gm, '<h2 style="color: #1f2937; margin: 20px 0 15px 0; font-size: 18px;">$1</h2>');
    html = html.replace(/# (.*?)$/gm, '<h1 style="color: #1f2937; margin: 25px 0 20px 0; font-size: 20px;">$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937;">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; overflow: auto; border-left: 4px solid #3b82f6; margin: 10px 0;"><code style="font-family: \'Monaco\', \'Menlo\', monospace; font-size: 13px;">$2</code></pre>');
    html = html.replace(/`(.*?)`/g, '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: \'Monaco\', \'Menlo\', monospace; font-size: 13px;">$1</code>');
    html = html.replace(/> (.*?)$/gm, '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 12px; margin: 10px 0; color: #6b7280; font-style: italic;">$1</blockquote>');
    html = html.replace(/\n/g, '<br>');
    return html;
  };

  // Styles
  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    infoBar: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '25px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    },
    statusChip: {
      padding: '8px 16px',
      borderRadius: '25px',
      fontSize: '13px',
      fontWeight: '600',
      backgroundColor: sessionActive ? '#10b981' : '#6b7280',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    userInput: {
      width: '100%',
      padding: '25px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      marginBottom: '25px',
      minHeight: '120px',
      resize: 'vertical',
      fontSize: '16px',
      fontFamily: 'inherit',
      lineHeight: '1.5',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px 1fr',
      gap: '25px',
      marginTop: '25px'
    },
    chatPanel: {
      backgroundColor: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '16px',
      padding: '25px',
      height: '700px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
    },
    chatHeader: {
      fontSize: '22px',
      fontWeight: '700',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      paddingBottom: '20px',
      borderBottom: '2px solid #f3f4f6'
    },
    select: {
      width: '100%',
      padding: '14px',
      marginBottom: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: 'white',
      fontWeight: '500'
    },
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      border: '2px solid #f3f4f6',
      padding: '20px',
      borderRadius: '10px',
      backgroundColor: '#fafbfc'
    },
    message: {
      marginBottom: '25px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #f3f4f6'
    },
    controls: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
      border: '2px solid #e5e7eb'
    },
    button: {
      padding: '14px 24px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    startButton: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    stopButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    resetButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    exportButton: {
      backgroundColor: '#8b5cf6',
      color: 'white'
    },
    accordion: {
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      marginBottom: '15px',
      overflow: 'hidden'
    },
    accordionSummary: {
      padding: '15px',
      backgroundColor: '#f9fafb',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    accordionContent: {
      padding: '20px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: 'white'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{margin: 0, fontSize: '36px', fontWeight: '800'}}>
          🤖 AI Collaboration Platform
        </h1>
        <p style={{margin: '15px 0 0 0', opacity: 0.9, fontSize: '18px'}}>
          Claude & ChatGPT arbeiten zusammen an deinen Projekten
        </p>
      </div>
      
      {/* Info Bar */}
      <div style={styles.infoBar}>
        <div style={styles.statusChip}>
          {sessionActive ? '🟢 AKTIV' : '⚪ BEREIT'}
        </div>
        <div><strong>Tokens:</strong> {totalTokens.toLocaleString()}</div>
        <div><strong>Zeit:</strong> {formatTime(elapsedTime)}</div>
        <div><strong>Iteration:</strong> {currentIteration}/8</div>
        {sessionActive && (
          <button style={{...styles.button, ...styles.exportButton}} onClick={exportSession}>
            📥 Export JSON
          </button>
        )}
      </div>
      
      {/* User Input */}
      {!sessionActive && (
        <textarea
          style={styles.userInput}
          placeholder="🎯 Beschreibe deine Programmieraufgabe hier...

💡 Beispiele:
• Erstelle eine Todo-App in React mit LocalStorage
• Entwickle einen REST API Server in Node.js  
• Schreibe ein Python-Script für Datenanalyse
• Baue eine responsive Website mit CSS Grid
• Implementiere einen Chatbot mit OpenAI API"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      )}
      
      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Claude Panel */}
        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>
            🦙 Claude {currentTurn === 'claude' && '⚡'}
            {currentTurn === 'claude' && (
              <div style={{fontSize: '12px', color: '#10b981', fontWeight: '500'}}>
                Denkt nach...
              </div>
            )}
          </div>
          
          <select 
            style={styles.select} 
            value={claudeModel} 
            onChange={(e) => setClaudeModel(e.target.value)}
          >
            <option value="">🔧 Modell wählen...</option>
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Empfohlen)</option>
            <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Schnell)</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus (Präzise)</option>
          </select>
          
          <select 
            style={styles.select} 
            value={claudeRole} 
            onChange={(e) => setClaudeRole(e.target.value)}
          >
            <option value="">👤 Rolle wählen...</option>
            <option value="programmer">👨‍💻 Programmer</option>
            <option value="reviewer">🔍 Code Reviewer</option>
            <option value="architect">🏗️ Software Architect</option>
            <option value="tester">🧪 QA Tester</option>
            <option value="devops">⚙️ DevOps Engineer</option>
            <option value="security">🔒 Security Expert</option>
            <option value="ui">🎨 UI/UX Designer</option>
            <option value="data">📊 Data Scientist</option>
          </select>
          
          <div style={styles.messagesArea}>
            {messages.filter(m => m.sender === 'claude').length === 0 ? (
              <div style={{textAlign: 'center', color: '#6b7280', marginTop: '80px'}}>
                <div style={{fontSize: '64px', marginBottom: '15px'}}>🦙</div>
                <div style={{fontSize: '16px', fontWeight: '500'}}>Warte auf Nachrichten...</div>
              </div>
            ) : (
              messages.filter(m => m.sender === 'claude').map(msg => (
                <div key={msg.id} style={styles.message}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <small style={{color: '#6b7280', fontWeight: '500'}}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </small>
                    <small style={{color: '#10b981', fontWeight: '700'}}>
                      {msg.tokens} tokens
                    </small>
                  </div>
                  <div dangerouslySetInnerHTML={{__html: renderMessage(msg)}} />
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div style={styles.controls}>
          {!sessionActive ? (
            <button 
              style={{...styles.button, ...styles.startButton}}
              onClick={startSession}
            >
              ▶️ Session starten
            </button>
          ) : (
            <button 
              style={{...styles.button, ...styles.stopButton}}
              onClick={stopSession}
            >
              ⏹️ Session stoppen
            </button>
          )}
          
          <button 
            style={{...styles.button, ...styles.resetButton}}
            onClick={resetSession}
            disabled={sessionActive}
          >
            🔄 Reset
          </button>
          
          {/* Code Executor */}
          <details style={styles.accordion}>
            <summary style={styles.accordionSummary}>
              🔧 Code Executor
            </summary>
            <div style={styles.accordionContent}>
              <select 
                style={{...styles.select, marginBottom: '12px'}} 
                value={codeLanguage} 
                onChange={(e) => setCodeLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="shell">Shell</option>
              </select>
              
              <textarea 
                placeholder={`${codeLanguage} Code eingeben...`}
                style={{
                  width: '100%', 
                  height: '100px', 
                  marginBottom: '12px', 
                  padding: '12px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontFamily: 'Monaco, Menlo, monospace',
                  fontSize: '13px'
                }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              
              <button 
                style={{
                  ...styles.button, 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  width: '100%'
                }}
                onClick={executeCode}
                disabled={!code.trim() || isRunning}
              >
                {isRunning ? '⏳ Läuft...' : '▶️ Ausführen'}
              </button>
              
              {codeOutput && (
                <div style={{
                  marginTop: '15px', 
                  padding: '15px', 
                  backgroundColor: codeOutput.includes('❌') ? '#fef2f2' : '#f0fdf4', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px'
                }}>
                  <pre style={{
                    margin: 0, 
                    fontSize: '12px', 
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Monaco, Menlo, monospace'
                  }}>
                    {codeOutput}
                  </pre>
                </div>
              )}
            </div>
          </details>
          
          {/* MCP Tools */}
          <details style={styles.accordion}>
            <summary style={styles.accordionSummary}>
              🔌 MCP Tools 
              <span style={{
                fontSize: '11px', 
                marginLeft: '10px', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                backgroundColor: mcpConnected ? '#10b981' : '#6b7280', 
                color: 'white',
                fontWeight: '600'
              }}>
                {mcpConnected ? 'Verbunden' : 'Getrennt'}
              </span>
            </summary>
            <div style={styles.accordionContent}>
              <button 
                style={{
                  ...styles.button, 
                  backgroundColor: mcpConnected ? '#ef4444' : '#10b981', 
                  color: 'white', 
                  width: '100%', 
                  marginBottom: '15px'
                }}
                onClick={() => setMcpConnected(!mcpConnected)}
              >
                {mcpConnected ? '🔌 Trennen' : '🔗 Verbinden'}
              </button>
              
              {mcpConnected && (
                <>
                  <select 
                    style={{...styles.select, marginBottom: '12px'}} 
                    value={selectedTool} 
                    onChange={(e) => setSelectedTool(e.target.value)}
                  >
                    <option value="">Tool wählen...</option>
                    <option value="file_search">📁 File Search</option>
                    <option value="web_search">🌐 Web Search</option>
                    <option value="database">🗄️ Database Query</option>
                    <option value="api_call">🔗 API Call</option>
                  </select>
                  
                  {selectedTool && (
                    <>
                      <input 
                        type="text"
                        placeholder="Tool-Parameter eingeben..."
                        style={{
                          width: '100%', 
                          padding: '12px', 
                          marginBottom: '12px', 
                          border: '2px solid #e5e7eb', 
                          borderRadius: '8px'
                        }}
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                      />
                      
                      <button 
                        style={{
                          ...styles.button, 
                          backgroundColor: '#8b5cf6', 
                          color: 'white', 
                          width: '100%'
                        }}
                        onClick={executeTool}
                        disabled={!toolInput.trim()}
                      >
                        ⚡ Ausführen
                      </button>
                      
                      {toolOutput && (
                        <div style={{
                          marginTop: '15px', 
                          padding: '15px', 
                          backgroundColor: '#f8fafc', 
                          border: '2px solid #e5e7eb', 
                          borderRadius: '8px'
                        }}>
                          <pre style={{
                            margin: 0, 
                            fontSize: '12px', 
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'Monaco, Menlo, monospace'
                          }}>
                            {toolOutput}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </details>
        </div>
        
        {/* ChatGPT Panel */}
        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>
            🤖 ChatGPT {currentTurn === 'gpt' && '⚡'}
            {currentTurn === 'gpt' && (
              <div style={{fontSize: '12px', color: '#10b981', fontWeight: '500'}}>
                Denkt nach...
              </div>
            )}
          </div>
          
          <select 
            style={styles.select} 
            value={gptModel} 
            onChange={(e) => setGptModel(e.target.value)}
          >
            <option value="">🔧 Modell wählen...</option>
            <option value="gpt-4o">GPT-4o (Empfohlen)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (Schnell)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
          
          <select 
            style={styles.select} 
            value={gptRole} 
            onChange={(e) => setGptRole(e.target.value)}
          >
            <option value="">👤 Rolle wählen...</option>
            <option value="programmer">👨‍💻 Programmer</option>
            <option value="reviewer">🔍 Code Reviewer</option>
            <option value="architect">🏗️ Software Architect</option>
            <option value="tester">🧪 QA Tester</option>
            <option value="devops">⚙️ DevOps Engineer</option>
            <option value="security">🔒 Security Expert</option>
            <option value="ui">🎨 UI/UX Designer</option>
            <option value="data">📊 Data Scientist</option>
          </select>
          
          <div style={styles.messagesArea}>
            {messages.filter(m => m.sender === 'gpt').length === 0 ? (
              <div style={{textAlign: 'center', color: '#6b7280', marginTop: '80px'}}>
                <div style={{fontSize: '64px', marginBottom: '15px'}}>🤖</div>
                <div style={{fontSize: '16px', fontWeight: '500'}}>Warte auf Nachrichten...</div>
              </div>
            ) : (
              messages.filter(m => m.sender === 'gpt').map(msg => (
                <div key={msg.id} style={styles.message}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <small style={{color: '#6b7280', fontWeight: '500'}}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </small>
                    <small style={{color: '#10b981', fontWeight: '700'}}>
                      {msg.tokens} tokens
                    </small>
                  </div>
                  <div dangerouslySetInnerHTML={{__html: renderMessage(msg)}} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiCollaborationPlatform;
