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

const MOVE_COMMANDS: CommandKind[] = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'STOP'];

const Divider = () => <span style={{ color: '#c0b0a0', fontSize: 16, userSelect: 'none' }}>|</span>;

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

  const handleLoopEnd = () => {
    const t = parseInt(loopTimes, 10);
    if (isNaN(t) || t < 1) return;
    onLoopEnd(t);
    setLoopTimes('2');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Movement commands */}
        {MOVE_COMMANDS.map(cmd => (
          <DraggableCmd key={cmd} cmd={cmd} disabled={isRunning} onClick={() => onCommand(cmd)} />
        ))}

        <Divider />

        {/* Loop */}
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
                background: COLOR_BG_LIGHT,
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                color: COLOR_TEXT,
                outline: 'none',
                textAlign: 'center',
              }}
            />
            <button
              onClick={handleLoopEnd}
              disabled={isRunning}
              style={btn({ background: '#c8e6c9', borderColor: '#4caf50' })}
            >
              LOOP END
            </button>
          </div>
        ) : (
          <button disabled style={disabledBtn()}>
            LOOP END
          </button>
        )}

        <Divider />

        {/* If */}
        <select
          disabled={isRunning}
          value={selectedCondition}
          onChange={e => setSelectedCondition(e.target.value as Condition)}
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

        <button
          disabled={isRunning}
          onClick={() => onIfStart(selectedCondition)}
          style={isRunning ? disabledBtn() : btn({ background: '#fff8e8', borderColor: '#c0a030' })}
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

        <Divider />

        {/* Actions */}
        <button
          disabled={isRunning || !hasProgram}
          onClick={onClear}
          style={
            isRunning || !hasProgram ? disabledBtn({ color: '#c0392b' }) : btn({ color: '#c0392b' })
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
        <button disabled={!isRunning} onClick={onReset} style={!isRunning ? disabledBtn() : btn()}>
          RESET
        </button>
      </div>
    </div>
  );
};
