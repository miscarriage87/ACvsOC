import React, { useState } from 'react';

export default function MCPTools({ 
  mcpConnected, 
  setMcpConnected, 
  selectedTool, 
  setSelectedTool, 
  toolInput, 
  setToolInput, 
  toolOutput, 
  executeTool 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const mcpTools = [
    { id: 'file_search', name: '📁 File Search', description: 'Durchsuche Dateien im Projekt' },
    { id: 'web_search', name: '🌐 Web Search', description: 'Suche im Internet' },
    { id: 'database', name: '🗄️ Database Query', description: 'Datenbankabfragen ausführen' },
    { id: 'api_call', name: '🔗 API Call', description: 'REST API Aufrufe' }
  ];

  return (
    <div className="mcp-accordion">
      <div 
        className="mcp-summary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          🔌 MCP Tools
          <span className={`mcp-status ${mcpConnected ? 'connected' : 'disconnected'}`}>
            {mcpConnected ? 'Verbunden' : 'Getrennt'}
          </span>
        </span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </div>
      
      {isOpen && (
        <div className="mcp-content">
          <button 
            className="mcp-btn"
            onClick={() => setMcpConnected(!mcpConnected)}
          >
            {mcpConnected ? '🔌 Trennen' : '🔗 Verbinden'}
          </button>
          
          {mcpConnected && (
            <>
              <div className="mcp-tools-list">
                {mcpTools.map(tool => (
                  <div 
                    key={tool.id}
                    className={`mcp-tool-item${selectedTool === tool.id ? ' mcp-tool-item-selected' : ''}`}
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <div className="mcp-tool-name">{tool.name}</div>
                    <div className="mcp-tool-desc">{tool.description}</div>
                  </div>
                ))}
              </div>
              
              {selectedTool && (
                <>
                  <input 
                    type="text"
                    className="mcp-input"
                    placeholder="Tool-Parameter eingeben..."
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                  />
                  
                  <button 
                    className="mcp-execute-btn"
                    onClick={executeTool}
                    disabled={!toolInput.trim()}
                  >
                    ⚡ Ausführen
                  </button>
                  
                  {toolOutput && (
                    <div className="mcp-output">
                      <pre className="mcp-output-pre">
                        {toolOutput}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 