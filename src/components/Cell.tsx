import React from 'react';
import type { CellKind } from '../types';

type Props = {
  type: CellKind;
  onClick: () => void;
  isRunning?: boolean;
  isManual: boolean;
  isError?: boolean;
};

const getColor = (type: CellKind) => {
  switch (type) {
    case 'robot':
      return '#e63946';
    case 'start':
      return '#457b9d';
    case 'finish':
      return '#e9c46a';
    case 'wall':
      return '#6b5344';
    default:
      return 'transparent';
  }
};

export const Cell: React.FC<Props> = ({ type, onClick, isRunning, isManual, isError }) => (
  <div
    onClick={onClick}
    style={{
      position: 'relative',
      overflow: 'hidden',
      width: 48,
      height: 48,
      backgroundColor: getColor(type),
      cursor: isManual ? 'pointer' : isRunning ? 'default' : 'pointer',
      boxSizing: 'border-box',
      border: '1px solid #c8bfb0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      userSelect: 'none',
      fontWeight: 700,
      color: 'rgba(255,255,255,0.85)',
    }}
  >
    {type === 'start' && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '14px 14px 0 0',
          borderColor: 'rgba(255,255,255,0.4) transparent transparent transparent',
        }}
      />
    )}
    {type === 'finish' && (
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 0 14px 14px',
          borderColor: 'transparent transparent rgba(255,255,255,0.4) transparent',
        }}
      />
    )}
  </div>
);
