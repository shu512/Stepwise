import { useState } from 'react';
import { COLOR_BG, COLOR_BG_LIGHT, COLOR_BORDER, COLOR_TEXT } from '../constants';
import type { CommandKind, Condition } from '../types';
import { DraggableCmd } from './ui/DraggableCmd';
import { Spinner } from './ui/Spinner';

type Props = {
  isRunning: boolean;
  isInLoop: boolean;
  isInIf: boolean;
  canElse: boolean;
  hasProgram: boolean;
  speed: number;
  onCommand: (cmd: CommandKind) => void;
  onLoopStart: () => void;
  onLoopEnd: (times: number) => void;
  onIfStart: (condition: Condition) => void;
  onIfElse: () => void;
  onIfEnd: () => void;
  onClear: () => void;
  onRun: () => void;
  onReset: () => void;
  onSpeedChange: (multiplier: number) => void;
};

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'on_finish', label: 'на финише' },
  { value: 'wall_above', label: 'стена сверху' },
  { value: 'wall_below', label: 'стена снизу' },
  { value: 'wall_left', label: 'стена слева' },
  { value: 'wall_right', label: 'стена справа' },
];

const SPEEDS = [0.5, 1, 2, 4];

const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: '5px 12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: COLOR_BORDER,
  borderRadius: 3,
  background: COLOR_BG,
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: 13,
  fontWeight: 600,
  color: COLOR_TEXT,
  ...extra,
});

const disabledBtn = (extra?: React.CSSProperties): React.CSSProperties =>
  btn({ opacity: 0.4, cursor: 'not-allowed', ...extra });

const vDivider = (
  <div style={{ width: 1, background: '#d0c8b8', alignSelf: 'stretch', margin: '0 4px' }} />
);

export const Controls: React.FC<Props> = ({
  isRunning,
  isInLoop,
  isInIf,
  canElse,
  hasProgram,
  speed,
  onCommand,
  onLoopStart,
  onLoopEnd,
  onIfStart,
  onIfElse,
  onIfEnd,
  onClear,
  onRun,
  onReset,
  onSpeedChange,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<Condition>('on_finish');
  const [loopTimes, setLoopTimes] = useState('2');

  const handleLoopEnd = () => {
    const t = parseInt(loopTimes, 10);
    if (isNaN(t) || t < 1) return;
    onLoopEnd(t);
    setLoopTimes('2');
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, auto)',
          gridTemplateRows: 'repeat(2, auto)',
          gap: 3,
        }}
      >
        <DraggableCmd cmd="UP" disabled={isRunning} onClick={() => onCommand('UP')} />
        <DraggableCmd cmd="DOWN" disabled={isRunning} onClick={() => onCommand('DOWN')} />
        <button
          disabled={isRunning}
          onClick={() => onCommand('STOP')}
          style={{
            ...(isRunning ? disabledBtn({ color: '#c0392b' }) : btn({ color: '#c0392b' })),
            gridRow: '1 / 3',
            gridColumn: 3,
            alignSelf: 'stretch',
          }}
        >
          STOP
        </button>
        <DraggableCmd cmd="LEFT" disabled={isRunning} onClick={() => onCommand('LEFT')} />
        <DraggableCmd cmd="RIGHT" disabled={isRunning} onClick={() => onCommand('RIGHT')} />
      </div>

      {vDivider}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <button
          disabled={isRunning}
          onClick={onLoopStart}
          style={
            isRunning
              ? disabledBtn()
              : btn(isInLoop ? { background: '#fde8a0', borderColor: '#c0a030' } : {})
          }
        >
          LOOP START
        </button>
        {isInLoop ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <button
              onClick={handleLoopEnd}
              disabled={isRunning}
              style={btn({ background: '#c8e6c9', borderColor: '#4caf50' })}
            >
              LOOP END
            </button>
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
                width: 36,
                padding: '4px',
                border: '1px solid #c0a030',
                borderRadius: 3,
                background: COLOR_BG_LIGHT,
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                color: COLOR_TEXT,
                outline: 'none',
                textAlign: 'center',
              }}
            />
          </div>
        ) : (
          <button disabled style={disabledBtn()}>
            LOOP END
          </button>
        )}
      </div>

      {vDivider}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <select
          disabled={isRunning}
          value={selectedCondition}
          onChange={e => {
            const condition = e.target.value as Condition;
            setSelectedCondition(condition);
            if (!isRunning) onIfStart(condition);
          }}
          style={{
            padding: '5px 8px',
            border: '1px solid #b0a090',
            borderRadius: 3,
            background: COLOR_BG,
            fontFamily: 'monospace',
            fontSize: 12,
            color: COLOR_TEXT,
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
        <div style={{ display: 'flex', gap: 3 }}>
          <button
            disabled={isRunning}
            onClick={() => onIfStart(selectedCondition)}
            style={
              isRunning ? disabledBtn() : btn({ background: '#fff8e8', borderColor: '#c0a030' })
            }
          >
            IF
          </button>
          <button
            disabled={isRunning || !canElse}
            onClick={onIfElse}
            style={
              isRunning || !canElse
                ? disabledBtn()
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
                ? disabledBtn()
                : btn({ background: '#c8e6c9', borderColor: '#4caf50' })
            }
          >
            IF END
          </button>
        </div>
      </div>

      {vDivider}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          <button
            disabled={isRunning}
            onClick={onRun}
            style={btn({
              background: '#c8e6c9',
              borderColor: '#4caf50',
              opacity: isRunning ? 0.4 : 1,
              flex: 1,
            })}
          >
            {isRunning ? <Spinner /> : 'RUN'}
          </button>
          <button
            disabled={!isRunning}
            onClick={onReset}
            style={!isRunning ? disabledBtn() : btn()}
          >
            RESET
          </button>
        </div>
        <button
          disabled={isRunning || !hasProgram}
          onClick={onClear}
          style={
            isRunning || !hasProgram ? disabledBtn({ color: '#c0392b' }) : btn({ color: '#c0392b' })
          }
        >
          CLEAR
        </button>
      </div>

      {vDivider}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 3 }}>
        {SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            style={btn({
              padding: '5px 8px',
              fontSize: 11,
              background: speed === s ? '#e8e0d0' : COLOR_BG,
              borderColor: speed === s ? '#8a7060' : COLOR_BORDER,
              fontWeight: speed === s ? 700 : 600,
            })}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
};
