import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';

export default function ModelSelector({ side }) {
  const label = side === 'claude' ? 'Anthropic Modell' : 'OpenAI Modell';
  return (
    <Tooltip title={`Wähle das Modell für ${side === 'claude' ? 'Claude' : 'ChatGPT'}`}> 
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>{label}</InputLabel>
        <Select label={label} defaultValue="">
          <MenuItem value="">(Modell wählen)</MenuItem>
          <MenuItem value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</MenuItem>
          <MenuItem value="gpt-4-1106-preview">gpt-4-1106-preview</MenuItem>
        </Select>
      </FormControl>
    </Tooltip>
  );
} 