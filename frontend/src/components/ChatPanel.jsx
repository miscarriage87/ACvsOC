import React, { useRef, useEffect } from 'react';
import { marked } from 'marked';

const roles = [
  { id: 'programmer', name: '👨‍💻 Programmer', prompt: 'Du bist ein erfahrener Programmierer. Schreibe sauberen, effizienten Code.' },
  { id: 'reviewer', name: '🔍 Code Reviewer', prompt: 'Du bist ein Code-Reviewer. Analysiere Code auf Qualität, Bugs und Verbesserungen.' },
  { id: 'architect', name: '🏗️ Software Architect', prompt: 'Du bist ein Software-Architekt. Entwerfe skalierbare Systemarchitekturen.' },
  { id: 'tester', name: '🧪 QA Tester', prompt: 'Du bist ein QA-Tester. Erstelle Testfälle und finde Bugs.' },
  { id: 'devops', name: '⚙️ DevOps Engineer', prompt: 'Du bist ein DevOps-Engineer. Optimiere Deployment und Infrastructure.' },
  { id: 'security', name: '🔒 Security Expert', prompt: 'Du bist ein Security-Experte. Identifiziere Sicherheitslücken.' },
  { id: 'ui', name: '🎨 UI/UX Designer', prompt: 'Du bist ein UI/UX Designer. Entwerfe benutzerfreundliche Interfaces.' },
  { id: 'data', name: '📊 Data Scientist', prompt: 'Du bist ein Data Scientist. Analysiere Daten und erstelle ML-Modelle.' }
];

export default function ChatPanel({ 
  side, 
  messages, 
  model, 
  setModel, 
  role, 
  setRole, 
  isActive,
  availableModels = []
}) {
  const messagesEndRef = useRef(null);
  const isClaudeSide = side === 'claude';
  const title = isClaudeSide ? '🦙 Claude' : '🤖 ChatGPT';
  const color = isClaudeSide ? '#f97316' : '#10b981';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessage = (msg) => {
    const html = marked.parse(msg.content || '');
    return html;
  };

  const styles = {
    panel: {
      backgroundColor: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '16px',
      padding: '25px',
      height: '700px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
    },
    header: {
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
      fontWeight: '500',
      cursor: 'pointer'
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
    messageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    timestamp: {
      color: '#6b7280',
      fontWeight: '500',
      fontSize: '12px'
    },
    tokens: {
      color: '#10b981',
      fontWeight: '700',
      fontSize: '12px'
    },
    loading: {
      fontSize: '12px',
      color: '#10b981',
      fontWeight: '500'
    },
    emptyState: {
      textAlign: 'center',
      color: '#6b7280',
      marginTop: '80px'
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        {title} {isActive && '⚡'}
        {isActive && (
          <div style={styles.loading}>
            Denkt nach...
          </div>
        )}
      </div>
      
      <select 
        style={styles.select} 
        value={model} 
        onChange={(e) => setModel(e.target.value)}
      >
        <option value="">🔧 Modell wählen...</option>
        {availableModels.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      
      <select 
        style={styles.select} 
        value={role} 
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">👤 Rolle wählen...</option>
        {roles.map(r => (
          <option key={r.id} value={r.id} title={r.prompt}>
            {r.name}
          </option>
        ))}
      </select>
      
      <div style={styles.messagesArea}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{fontSize: '64px', marginBottom: '15px'}}>
              {isClaudeSide ? '🦙' : '🤖'}
            </div>
            <div style={{fontSize: '16px', fontWeight: '500'}}>
              Warte auf Nachrichten...
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} style={styles.message}>
                <div style={styles.messageHeader}>
                  <small style={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                  {msg.tokens && (
                    <small style={styles.tokens}>
                      {msg.tokens} tokens
                    </small>
                  )}
                </div>
                <div 
                  dangerouslySetInnerHTML={{__html: renderMessage(msg)}}
                  style={{
                    lineHeight: '1.6',
                    '& pre': { 
                      backgroundColor: '#f3f4f6', 
                      padding: '12px', 
                      borderRadius: '6px', 
                      overflow: 'auto' 
                    },
                    '& code': { 
                      backgroundColor: '#f3f4f6', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontFamily: 'Monaco, Menlo, monospace',
                      fontSize: '13px'
                    }
                  }}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
} 