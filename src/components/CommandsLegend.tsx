import { useState } from 'react';
import { COLOR_BORDER } from '../constants';

const COMMANDS = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'STOP'];
const CONDITIONS = ['on_finish', 'wall_above', 'wall_below', 'wall_left', 'wall_right'];

const chip = (label: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '1px 7px',
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: 3,
  fontFamily: 'monospace',
  fontSize: 11,
  background: '#f5f0e8',
  color: '#2a2a2a',
});

export const CommandsLegend: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: 6 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontSize: 10,
          color: COLOR_BORDER,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        {open ? '▾' : '▸'} ДОСТУПНЫЕ КОМАНДЫ
      </button>

      {open && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>
            <div style={{ fontSize: 10, color: '#a09080', marginBottom: 4 }}>Движение</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {COMMANDS.map(cmd => (
                <span key={cmd} style={chip(cmd)}>
                  {cmd}()
                </span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#a09080', marginBottom: 4 }}>Условия</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {CONDITIONS.map(cond => (
                <span key={cond} style={chip(cond)}>
                  {cond}()
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
