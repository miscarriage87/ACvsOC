import React from 'react';
import { Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress } from '@mui/material';
import { marked } from 'marked';

const roles = [
  { id: 'programmer', name: 'Programmer', prompt: 'Du bist ein erfahrener Programmierer. Schreibe sauberen, effizienten Code.' },
  { id: 'reviewer', name: 'Code Reviewer', prompt: 'Du bist ein Code-Reviewer. Analysiere Code auf Qualität, Bugs und Verbesserungen.' },
  { id: 'architect', name: 'Software Architect', prompt: 'Du bist ein Software-Architekt. Entwerfe skalierbare Systemarchitekturen.' },
  { id: 'tester', name: 'QA Tester', prompt: 'Du bist ein QA-Tester. Erstelle Testfälle und finde Bugs.' },
  { id: 'devops', name: 'DevOps Engineer', prompt: 'Du bist ein DevOps-Engineer. Optimiere Deployment und Infrastructure.' },
  { id: 'security', name: 'Security Expert', prompt: 'Du bist ein Security-Experte. Identifiziere Sicherheitslücken.' },
  { id: 'ui', name: 'UI/UX Designer', prompt: 'Du bist ein UI/UX Designer. Entwerfe benutzerfreundliche Interfaces.' },
  { id: 'data', name: 'Data Scientist', prompt: 'Du bist ein Data Scientist. Analysiere Daten und erstelle ML-Modelle.' },
  { id: 'product', name: 'Product Manager', prompt: 'Du bist ein Product Manager. Definiere Requirements und Prioritäten.' },
  { id: 'consultant', name: 'Tech Consultant', prompt: 'Du bist ein Tech-Berater. Gib strategische Technologie-Empfehlungen.' }
];

const models = {
  claude: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229'
  ],
  gpt: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo'
  ]
};

export default function ChatPanel({ side, messages, model, setModel, role, setRole, isActive }) {
  const isClaudeSide = side === 'claude';
  const availableModels = isClaudeSide ? models.claude : models.gpt;
  const title = isClaudeSide ? '🦙 Claude' : '🤖 ChatGPT';
  const color = isClaudeSide ? '#f97316' : '#10b981';

  const renderMessage = (message) => {
    const html = marked(message.content);
    return (
      <Box 
        key={message.id}
        sx={{ 
          mb: 2, 
          p: 2, 
          bgcolor: isClaudeSide ? 'orange.50' : 'green.50',
          borderRadius: 2,
          border: `1px solid ${isClaudeSide ? '#fed7aa' : '#bbf7d0'}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
          {message.tokens && (
            <Chip label={`${message.tokens} tokens`} size="small" variant="outlined" />
          )}
        </Box>
        <Box 
          dangerouslySetInnerHTML={{ __html: html }}
          sx={{ 
            '& pre': { bgcolor: 'grey.100', p: 1, borderRadius: 1, overflow: 'auto' },
            '& code': { bgcolor: 'grey.100', px: 0.5, borderRadius: 0.5 },
            '& h1, & h2, & h3': { mt: 1, mb: 1 }
          }}
        />
      </Box>
    );
  };

  return (
    <Paper elevation={2} sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: isActive ? `${color}20` : 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Typography variant="h6" sx={{ color, fontWeight: 'bold' }}>
          {title}
        </Typography>
        {isActive && <CircularProgress size={16} />}
      </Box>

      {/* Model Selector */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Modell</InputLabel>
          <Select value={model} onChange={(e) => setModel(e.target.value)} label="Modell">
            {availableModels.map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Role Selector */}
        <FormControl fullWidth size="small">
          <InputLabel>Rolle</InputLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)} label="Rolle">
            {roles.map(r => (
              <MenuItem key={r.id} value={r.id} title={r.prompt}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Warte auf Nachrichten...
          </Typography>
        ) : (
          messages.map(renderMessage)
        )}
      </Box>
    </Paper>
  );
} 