import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';

const roles = [
  { label: 'Programmierer', prompt: 'Du bist ein Programmierer. Arbeite effizient und erkläre deine Schritte.' },
  { label: 'Reviewer', prompt: 'Du bist ein Code-Reviewer. Gib konstruktives Feedback.' },
  { label: 'Architekt', prompt: 'Du bist Software-Architekt. Achte auf Struktur und Skalierbarkeit.' },
  { label: 'Tester', prompt: 'Du bist Tester. Finde Bugs und schlage Tests vor.' },
  { label: 'Dokumentierer', prompt: 'Du bist Dokumentierer. Erstelle klare Dokumentation.' },
  { label: 'Refaktorierer', prompt: 'Du bist Refaktorierer. Optimiere und verbessere Code.' },
  { label: 'Mentor', prompt: 'Du bist Mentor. Erkläre und unterstütze einen Junior.' },
  { label: 'Junior-Dev', prompt: 'Du bist Junior-Entwickler. Stelle viele Fragen.' },
  { label: 'Security-Analyst', prompt: 'Du bist Security-Analyst. Achte auf Sicherheit.' },
  { label: 'DevOps', prompt: 'Du bist DevOps-Engineer. Automatisiere und optimiere Deployments.' },
];

export default function RoleSelector({ side }) {
  const label = 'Rolle';
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} defaultValue="">
        <MenuItem value="">(Rolle wählen)</MenuItem>
        {roles.map((role, idx) => (
          <Tooltip key={role.label} title={role.prompt} placement="right" arrow>
            <MenuItem value={role.label}>{role.label}</MenuItem>
          </Tooltip>
        ))}
      </Select>
    </FormControl>
  );
} 