import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { CommandKind, Condition } from '../types';
import { Spinner } from './Spinner';

type Props = {
  isRunning: boolean;
  isInLoop: boolean;
  isInIf: boolean;
  canElse: boolean;
  hasProgram: boolean;
  onCommand: (cmd: CommandKind) => void;
  onLoopStart: () => void;
  onLoopEnd: (times: number) => void;
  onIfStart: (condition: Condition) => void;
  onIfElse: () => void;
  onIfEnd: () => void;
  onClear: () => void;
  onRun: () => void;
  onReset: () => void;
};

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'on_finish', label: 'на финише' },
  { value: 'wall_above', label: 'стена сверху' },
  { value: 'wall_below', label: 'стена снизу' },
  { value: 'wall_left', label: 'стена слева' },
  { value: 'wall_right', label: 'стена справа' },
];

const Divider = () => <span style={{ color: '#c0b0a0', fontSize: 16, userSelect: 'none' }}>|</span>;

export const Controls: React.FC<Props> = ({
  isRunning,
  isInLoop,
  isInIf,
  canElse,
  hasProgram,
  onCommand,
  onLoopStart,
  onLoopEnd,
  onIfStart,
  onIfElse,
  onIfEnd,
  onClear,
  onRun,
  onReset,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<Condition>('on_finish');
  const [loopTimes, setLoopTimes] = useState('2');

  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '5px 12px',
    border: '1px solid #b0a090',
    borderRadius: 3,
    background: '#f5f0e8',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 600,
    color: '#2a2a2a',
    ...extra,
  });

  const disabledStyle = (extra?: React.CSSProperties): React.CSSProperties =>
    btn({ opacity: 0.4, cursor: 'not-allowed', ...extra });

  const DraggableCmd = ({ cmd }: { cmd: CommandKind }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `controls:${cmd}`,
      disabled: isRunning,
      data: { source: 'controls', type: 'command', cmd },
    });

    const baseStyle = isRunning
      ? disabledStyle(cmd === 'STOP' ? { color: '#c0392b' } : {})
      : btn(cmd === 'STOP' ? { color: '#c0392b', borderColor: '#e0a0a0' } : {});

    return (
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        disabled={isRunning}
        onClick={() => onCommand(cmd)}
        style={{
          ...baseStyle,
          opacity: isDragging ? 0.4 : (baseStyle.opacity ?? 1),
          touchAction: 'none',
        }}
      >
        {cmd}
      </button>
    );
  };

  const handleLoopEnd = () => {
    const t = parseInt(loopTimes, 10);
    if (isNaN(t) || t < 1) return;
    onLoopEnd(t);
    setLoopTimes('2');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {(['UP', 'DOWN', 'LEFT', 'RIGHT', 'STOP'] as CommandKind[]).map(cmd => (
          <DraggableCmd key={cmd} cmd={cmd} />
        ))}

        <Divider />

        <button
          disabled={isRunning}
          onClick={onLoopStart}
          style={
            isRunning
              ? disabledStyle()
              : btn(isInLoop ? { background: '#fde8a0', borderColor: '#c0a030' } : {})
          }
        >
          LOOP START
        </button>

        {isInLoop ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#a09080' }}>×</span>
            <input
              type="number"
              min={1}
              value={loopTimes}
              onChange={e => setLoopTimes(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleLoopEnd();
              }}
              style={{
                width: 44,
                padding: '4px 6px',
                border: '1px solid #c0a030',
                borderRadius: 3,
                background: '#fdfaf4',
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                color: '#2a2a2a',
                outline: 'none',
                textAlign: 'center',
              }}
            />
            <button
              onClick={handleLoopEnd}
              disabled={isRunning || !isInLoop}
              style={btn({ background: '#c8e6c9', borderColor: '#4caf50' })}
            >
              LOOP END
            </button>
          </div>
        ) : (
          <button disabled style={disabledStyle()}>
            LOOP END
          </button>
        )}

        <Divider />

        <select
          disabled={isRunning}
          value={selectedCondition}
          onChange={e => setSelectedCondition(e.target.value as Condition)}
          style={{
            padding: '5px 8px',
            border: '1px solid #b0a090',
            borderRadius: 3,
            background: '#f5f0e8',
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#2a2a2a',
            opacity: isRunning ? 0.4 : 1,
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          {CONDITIONS.map(c => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          disabled={isRunning}
          onClick={() => onIfStart(selectedCondition)}
          style={
            isRunning ? disabledStyle() : btn({ background: '#fff8e8', borderColor: '#c0a030' })
          }
        >
          IF
        </button>
        <button
          disabled={isRunning || !canElse}
          onClick={onIfElse}
          style={
            isRunning || !canElse
              ? disabledStyle()
              : btn({ background: '#fde8e8', borderColor: '#e08080' })
          }
        >
          ELSE
        </button>
        <button
          disabled={isRunning || !isInIf}
          onClick={onIfEnd}
          style={
            isRunning || !isInIf
              ? disabledStyle()
              : btn({ background: '#c8e6c9', borderColor: '#4caf50' })
          }
        >
          IF END
        </button>

        <Divider />

        <button
          disabled={isRunning || !hasProgram}
          onClick={onClear}
          style={
            isRunning || !hasProgram
              ? disabledStyle({ color: '#c0392b' })
              : btn({ color: '#c0392b' })
          }
        >
          CLEAR
        </button>

        <Divider />

        <button
          disabled={isRunning}
          onClick={onRun}
          style={btn({
            background: '#c8e6c9',
            borderColor: '#4caf50',
            opacity: isRunning ? 0.4 : 1,
          })}
        >
          {isRunning ? <Spinner /> : 'RUN'}
        </button>
        <button
          disabled={!isRunning}
          onClick={onReset}
          style={!isRunning ? disabledStyle() : btn()}
        >
          RESET
        </button>
      </div>
    </div>
  );
};
