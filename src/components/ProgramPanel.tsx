import { DragOverlay } from '@dnd-kit/core';
import { COLOR_BG_LIGHT, COLOR_BORDER, COLOR_TEXT, LOOP_COLORS } from '../constants';
import type { Condition, ProgramItem } from '../types';
import type { Lang } from '../utils/codegen';
import { CodeEditor } from './CodeEditor';
import { CommandChip } from './ui/CommandChip';
import { CommandsLegend } from './CommandsLegend';
import { ProgramDisplay } from './ProgramDisplay';
import { Spinner } from './ui/Spinner';

type StackEntry = {
  frame: { kind: string; condition?: Condition; then?: ProgramItem[] };
  items: ProgramItem[];
};

type Props = {
  program: ProgramItem[];
  editStack: StackEntry[];
  isRunning: boolean;
  lang: Lang;
  onRemove: (path: number[]) => void;
  onRemoveFromContext: (path: number[]) => void;
  onUpdateTimes: (path: number[], times: number) => void;
  onCancelBlock: () => void;
  activeItem: ProgramItem | null;
  isOverContainer: boolean;
  showEditor: boolean;
  code: string;
  onCodeChange: (v: string) => void;
  onParseCode: () => void;
  isParsing: boolean;
  parseError: string;
  modelUsed: string;
};

const IF_FRAME_LABELS: Record<string, string> = {
  if_then: 'then',
  if_else: 'else',
};

export const ProgramPanel: React.FC<Props> = ({
  program,
  editStack,
  isRunning,
  lang,
  onRemove,
  onRemoveFromContext,
  onUpdateTimes,
  onCancelBlock,
  activeItem,
  isOverContainer,
  showEditor,
  code,
  onCodeChange,
  onParseCode,
  isParsing,
  parseError,
  modelUsed,
}) => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 500,
        border: '1px solid #b0a090',
        borderRadius: 3,
        background: COLOR_BG_LIGHT,
        fontFamily: 'monospace',
        overflow: 'hidden',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ padding: 10, minHeight: 56 }}>
        <div style={{ fontSize: 10, color: '#a09080', marginBottom: 6, letterSpacing: '0.06em' }}>
          ПРОГРАММА
        </div>

        {program.length > 0 ? (
          <ProgramDisplay
            items={program}
            depth={0}
            containerPath={[]}
            onRemove={isRunning ? () => {} : onRemove}
            onUpdateTimes={isRunning ? () => {} : onUpdateTimes}
            disabled={isRunning}
          />
        ) : (
          <span style={{ color: '#c0b0a0', fontSize: 12 }}>пусто</span>
        )}

        {/* Unclosed block contexts */}
        {editStack.slice(1).map((entry, i) => {
          const kind = entry.frame.kind;
          const isLoop = kind === 'loop';
          const palette = isLoop
            ? LOOP_COLORS[(i + 1) % LOOP_COLORS.length]
            : { bg: '#fff8e8', border: '#c0a030' };
          const label = isLoop
            ? `тело цикла — уровень ${i + 1}`
            : `if ${entry.frame.condition} → ${IF_FRAME_LABELS[kind] ?? kind}`;

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
              <div
                style={{ fontSize: 10, color: palette.border, marginBottom: 4, fontWeight: 700 }}
              >
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

      {showEditor && (
        <div style={{ borderTop: '1px solid #e0d8cc', padding: 10, background: '#f7f3eb' }}>
          <div style={{ fontSize: 10, color: '#a09080', marginBottom: 6, letterSpacing: '0.06em' }}>
            ВВОД КОДА {modelUsed && <span style={{ color: COLOR_BORDER }}>· {modelUsed}</span>}
          </div>
          <CommandsLegend />
          <CodeEditor
            value={code}
            lang={lang}
            onChange={onCodeChange}
            onSubmit={onParseCode}
            disabled={isParsing}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 6,
              gap: 8,
            }}
          >
            {parseError ? (
              <span style={{ fontSize: 11, color: '#c0392b', flex: 1 }}>⚠ {parseError}</span>
            ) : (
              <span style={{ fontSize: 10, color: COLOR_BORDER }}>Ctrl+Enter — выполнить</span>
            )}
            <button
              onClick={onParseCode}
              disabled={isParsing || !code.trim()}
              style={{
                padding: '4px 14px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#4caf50',
                borderRadius: 3,
                background: isParsing || !code.trim() ? '#e8e0d4' : '#c8e6c9',
                color: isParsing || !code.trim() ? '#a09080' : COLOR_TEXT,
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 600,
                cursor: isParsing || !code.trim() ? 'not-allowed' : 'pointer',
                opacity: isParsing || !code.trim() ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {isParsing ? <Spinner /> : '▶ в блоки'}
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};
