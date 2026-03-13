import React from 'react';
import { COLOR_BG_LIGHT, COLOR_BORDER, COLOR_LABEL } from '../constants';
import type { DrawMode } from '../types';

const DRAW_MODES: { mode: DrawMode; label: string; color: string }[] = [
  { mode: 'wall', label: 'Стена', color: COLOR_LABEL },
  { mode: 'start', label: 'Старт', color: '#457b9d' },
  { mode: 'finish', label: 'Финиш', color: '#e9c46a' },
];

type Props = {
  drawMode: DrawMode;
  onDrawModeChange: (mode: DrawMode) => void;
};

export const DrawModeSelector: React.FC<Props> = ({ drawMode, onDrawModeChange }) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    <span style={{ fontSize: 11, color: '#a09080' }}>Рисовать:</span>
    {DRAW_MODES.map(({ mode, label, color }) => (
      <button
        key={mode}
        onClick={() => onDrawModeChange(mode)}
        style={{
          padding: '5px 12px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: drawMode === mode ? color : COLOR_BORDER,
          borderRadius: 3,
          background: drawMode === mode ? COLOR_BG_LIGHT : '#f0ebe0',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: 13,
          fontWeight: drawMode === mode ? 700 : 500,
          color,
          boxShadow: drawMode === mode ? `inset 0 -2px 0 ${color}` : 'none',
        }}
      >
        {label}
      </button>
    ))}
  </div>
);
