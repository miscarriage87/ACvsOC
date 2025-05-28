import React from 'react';

// [DEPRECATED] This component is no longer used in the new unified chat UI.

export default function InfoBar({ 
  sessionActive, 
  totalTokens, 
  elapsedTime, 
  currentIteration, 
  maxIterations,
  onExport
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = {
    container: {
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
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    label: {
      color: '#6b7280',
      fontSize: '14px'
    },
    value: {
      fontWeight: '600',
      fontSize: '14px',
      color: '#1f2937'
    },
    exportButton: {
      padding: '8px 16px',
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.statusChip}>
        {sessionActive ? '🟢 AKTIV' : '⚪ BEREIT'}
      </div>
      
      <div style={styles.infoItem}>
        <span style={styles.label}>Tokens:</span>
        <span style={styles.value}>{totalTokens.toLocaleString()}</span>
      </div>
      
      <div style={styles.infoItem}>
        <span style={styles.label}>Zeit:</span>
        <span style={styles.value}>{formatTime(elapsedTime)}</span>
      </div>
      
      <div style={styles.infoItem}>
        <span style={styles.label}>Iteration:</span>
        <span style={{
          ...styles.value,
          color: currentIteration >= maxIterations ? '#f59e0b' : '#1f2937'
        }}>
          {currentIteration}/{maxIterations}
        </span>
      </div>
      
      {sessionActive && (
        <button 
          style={styles.exportButton}
          onClick={onExport}
          onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
        >
          📥 Export JSON
        </button>
      )}
    </div>
  );
} 