import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, ListItemIcon, Chip, Button, TextField } from '@mui/material';
import { ExpandMore, Extension, CheckCircle, Error, PlayArrow } from '@mui/icons-material';

export default function MCPPanel() {
  const [connected, setConnected] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');

  const mcpTools = [
    { id: 'file_search', name: 'File Search', description: 'Durchsuche Dateien im Projekt' },
    { id: 'web_search', name: 'Web Search', description: 'Suche im Internet' },
    { id: 'database', name: 'Database Query', description: 'Datenbankabfragen ausführen' },
    { id: 'api_call', name: 'API Call', description: 'REST API Aufrufe' }
  ];

  const connectMCP = () => {
    setConnected(!connected);
  };

  const executeTool = () => {
    if (!selectedTool || !toolInput.trim()) return;
    
    const tool = mcpTools.find(t => t.id === selectedTool);
    setToolOutput(`Tool "${tool.name}" ausgeführt mit Input: "${toolInput}"\n\nSimuliertes Ergebnis:\n- Status: Erfolgreich\n- Daten: [Beispiel-Daten]`);
  };

  return (
    <Box>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Extension />
            <Typography variant="subtitle2">MCP Tools</Typography>
            <Chip 
              size="small" 
              label={connected ? 'Verbunden' : 'Getrennt'} 
              color={connected ? 'success' : 'default'}
              icon={connected ? <CheckCircle /> : <Error />}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant={connected ? 'outlined' : 'contained'} 
              size="small"
              onClick={connectMCP}
              color={connected ? 'error' : 'primary'}
            >
              {connected ? 'Trennen' : 'Verbinden'}
            </Button>
            
            {connected && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Verfügbare Tools:
                </Typography>
                <List dense>
                  {mcpTools.map(tool => (
                    <ListItem 
                      key={tool.id} 
                      button 
                      selected={selectedTool === tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      <ListItemIcon>
                        <Extension fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={tool.name} 
                        secondary={tool.description}
                        primaryTypographyProps={{ variant: 'caption' }}
                        secondaryTypographyProps={{ variant: 'caption', fontSize: '0.7em' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                {selectedTool && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Tool-Parameter eingeben..."
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<PlayArrow />}
                      onClick={executeTool}
                      disabled={!toolInput.trim()}
                    >
                      Ausführen
                    </Button>
                    
                    {toolOutput && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                          {toolOutput}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
} 