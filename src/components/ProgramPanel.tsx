import React from 'react';
import { ProgramDisplay } from './ProgramDisplay';
import type { ProgramItem, Condition } from '../types';
import { LOOP_COLORS } from '../constants';
import { countSteps } from '../utils/program';

type StackEntry = {
  frame: { kind: string; condition?: Condition; then?: ProgramItem[] };
  items: ProgramItem[];
};

type Props = {
  program: ProgramItem[];
  editStack: StackEntry[];
  isRunning: boolean;
  onRemove: (path: number[]) => void;
};

const IF_FRAME_LABELS: Record<string, string> = {
  if_then: 'then',
  if_else: 'else',
};

export const ProgramPanel: React.FC<Props> = ({ program, editStack, isRunning, onRemove }) => (
  <div
    style={{
      width: '100%',
      maxWidth: 500,
      minHeight: 56,
      border: '1px solid #b0a090',
      borderRadius: 3,
      padding: 10,
      background: '#fdfaf4',
      fontFamily: 'monospace',
    }}
  >
    <div style={{ fontSize: 10, color: '#a09080', marginBottom: 6, letterSpacing: '0.06em' }}>
      ПРОГРАММА {program.length > 0 && `· ~${countSteps(program)} шагов`}
    </div>

    {program.length > 0 ? (
      <ProgramDisplay items={program} depth={0} onRemove={isRunning ? undefined : onRemove} />
    ) : (
      <span style={{ color: '#c0b0a0', fontSize: 12 }}>пусто</span>
    )}

    {/* Незакрытые контексты */}
    {editStack.slice(1).map((entry, i) => {
      const kind = entry.frame.kind;
      const isLoop = kind === 'loop';
      const palette = isLoop
        ? LOOP_COLORS[(i + 1) % LOOP_COLORS.length]
        : { bg: '#fff8e8', border: '#c0a030' };
      const label = isLoop
        ? `тело цикла — уровень ${i + 1}`
        : `if ${(entry.frame as any).condition} → ${IF_FRAME_LABELS[kind] ?? kind}`;

      return (
        <div
          key={i}
          style={{
            marginTop: 8,
            padding: '6px 8px',
            border: `1px dashed ${palette.border}`,
            borderRadius: 3,
            background: palette.bg,
          }}
        >
          <div style={{ fontSize: 10, color: palette.border, marginBottom: 4, fontWeight: 700 }}>
            {label}
          </div>
          {entry.items.length > 0 ? (
            <ProgramDisplay items={entry.items} depth={i + 1} />
          ) : (
            <span style={{ color: '#999', fontSize: 11 }}>пусто</span>
          )}
        </div>
      );
    })}
  </div>
);
