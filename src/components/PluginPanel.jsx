import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, Button, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import { ExpandMore, PlayArrow, Code } from '@mui/icons-material';

export default function PluginPanel() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('Ausführung gestartet...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (language === 'javascript') {
        try {
          const result = eval(code);
          setOutput(`Ergebnis: ${result}`);
        } catch (error) {
          setOutput(`Fehler: ${error.message}`);
        }
      } else if (language === 'python') {
        setOutput('Python-Ausführung simuliert:\n# Ihr Code würde hier ausgeführt\nprint("Hello from Python!")');
      } else if (language === 'shell') {
        setOutput('Shell-Befehl simuliert:\n$ ' + code + '\nBefehl würde hier ausgeführt werden');
      }
    } catch (error) {
      setOutput(`Fehler: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Code />
            <Typography variant="subtitle2">Code Executor</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sprache</InputLabel>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)} label="Sprache">
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="shell">Shell</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              multiline
              rows={4}
              placeholder={`${language} Code eingeben...`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              size="small"
              fullWidth
            />
            
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<PlayArrow />}
              onClick={executeCode}
              disabled={!code.trim() || isRunning}
            >
              {isRunning ? 'Läuft...' : 'Ausführen'}
            </Button>
            
            {output && (
              <Alert severity={output.includes('Fehler') ? 'error' : 'success'} sx={{ mt: 1 }}>
                <pre style={{ margin: 0, fontSize: '0.8em', whiteSpace: 'pre-wrap' }}>
                  {output}
                </pre>
              </Alert>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
} 