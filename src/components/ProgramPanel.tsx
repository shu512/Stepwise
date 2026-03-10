import { DragOverlay } from '@dnd-kit/core';
import React from 'react';
import { LOOP_COLORS } from '../constants';
import type { Condition, ProgramItem } from '../types';
import { countSteps } from '../utils/program';
import { CommandChip } from './CommandChip';
import { ProgramDisplay } from './ProgramDisplay';

type StackEntry = {
  frame: { kind: string; condition?: Condition; then?: ProgramItem[] };
  items: ProgramItem[];
};

type Props = {
  program: ProgramItem[];
  editStack: StackEntry[];
  isRunning: boolean;
  onRemove: (path: number[]) => void;
  onRemoveFromContext: (path: number[]) => void;
  onUpdateTimes: (path: number[], times: number) => void;
  onCancelBlock: () => void;
  activeItem: ProgramItem | null;
  isOverContainer: boolean;
};

const IF_FRAME_LABELS: Record<string, string> = {
  if_then: 'then',
  if_else: 'else',
};

export const ProgramPanel: React.FC<Props> = ({
  program,
  editStack,
  isRunning,
  onRemove,
  onRemoveFromContext,
  onUpdateTimes,
  onCancelBlock,
  activeItem,
  isOverContainer,
}) => {
  return (
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

      <ProgramDisplay
        items={program}
        depth={0}
        containerPath={[]}
        onRemove={isRunning ? () => {} : onRemove}
        onUpdateTimes={isRunning ? () => {} : onUpdateTimes}
        disabled={isRunning}
      />

      <DragOverlay>
        {activeItem && !isOverContainer && (
          <>
            {activeItem.type === 'command' && <CommandChip cmd={activeItem.cmd} dimmed />}
            {activeItem.type === 'loop' && (
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  background: LOOP_COLORS[0].bg,
                  border: `1px solid ${LOOP_COLORS[0].border}`,
                  fontFamily: 'monospace',
                  color: LOOP_COLORS[0].border,
                  fontWeight: 700,
                  opacity: 0.8,
                }}
              >
                repeat ×{activeItem.times}
              </div>
            )}
            {activeItem.type === 'if' && (
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  background: '#fff8e8',
                  border: '1px solid #c0a030',
                  fontFamily: 'monospace',
                  color: '#c0a030',
                  fontWeight: 700,
                  opacity: 0.8,
                }}
              >
                if {activeItem.condition}
              </div>
            )}
          </>
        )}
      </DragOverlay>

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
            onClick={onCancelBlock}
            title="клик — отменить блок"
            style={{
              marginTop: 8,
              padding: '6px 8px',
              border: `1px dashed ${palette.border}`,
              borderRadius: 3,
              background: palette.bg,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 10, color: palette.border, marginBottom: 4, fontWeight: 700 }}>
              {label}
            </div>
            {entry.items.length > 0 ? (
              <ProgramDisplay
                items={entry.items}
                depth={i + 1}
                onRemove={onRemoveFromContext}
                onUpdateTimes={() => {}}
                disabled={false}
              />
            ) : (
              <span style={{ color: '#999', fontSize: 11 }}>пусто</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
