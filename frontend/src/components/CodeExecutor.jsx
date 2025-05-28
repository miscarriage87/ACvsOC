import React, { useState } from 'react';

export default function CodeExecutor({ code, setCode, codeLanguage, setCodeLanguage, executeCode, codeOutput, isRunning }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="code-accordion">
      <div 
        className="code-summary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>🔧 Code Executor</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </div>
      
      {isOpen && (
        <div className="code-content">
          <select 
            className="code-select"
            value={codeLanguage} 
            onChange={(e) => setCodeLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="shell">Shell</option>
          </select>
          
          <textarea 
            placeholder={`${codeLanguage} Code eingeben...`}
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          
          <button 
            className="code-btn"
            onClick={executeCode}
            disabled={!code.trim() || isRunning}
          >
            {isRunning ? '⏳ Läuft...' : '▶️ Ausführen'}
          </button>
          
          {codeOutput && (
            <div className="code-output">
              <pre className="code-output-pre">
                {codeOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 