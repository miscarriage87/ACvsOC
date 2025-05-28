import React from 'react';

export default function SessionControls({ sessionActive, onStart, onStop, onReset }) {
  const styles = {
    container: {
      marginBottom: '20px'
    },
    button: {
      width: '100%',
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
      gap: '8px',
      marginBottom: '10px'
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
      color: 'white',
      opacity: sessionActive ? 0.5 : 1,
      cursor: sessionActive ? 'not-allowed' : 'pointer'
    }
  };

  return (
    <div className="session-controls">
      {sessionActive && (
        <button 
          className="session-btn stop-btn"
          onClick={onStop}
        >
          ⏹️ Session stoppen
        </button>
      )}
    </div>
  );
} 