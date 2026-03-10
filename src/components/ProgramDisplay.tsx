import React, { useState } from 'react';
import type { ProgramItem } from '../types';
import { LOOP_COLORS } from '../constants';
import { CommandChip } from './CommandChip';
import { SortableItem } from './SortableItem';
import { DroppableContainer } from './DroppableContainer';

const IF_COLORS = [
  { bg: '#fff8e8', border: '#c0a030' },
  { bg: '#f0f8ff', border: '#4a90d9' },
];

type Props = {
  items: ProgramItem[];
  depth?: number;
  containerPath?: number[];
  blockId?: string;
  branchKey?: 'body' | 'then' | 'else';
  onRemove: (path: number[]) => void;
  onUpdateTimes: (path: number[], times: number) => void;
  disabled?: boolean;
};

export const ProgramDisplay: React.FC<Props> = ({
  items,
  depth = 0,
  containerPath = [],
  onRemove,
  onUpdateTimes,
  disabled = false,
  blockId,
  branchKey,
}) => {
  const loopPalette = LOOP_COLORS[depth % LOOP_COLORS.length];
  const ifPalette = IF_COLORS[depth % IF_COLORS.length];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const containerId = containerPath.join('-') || 'root';

  const startEditTimes = (id: string, currentTimes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingValue(String(currentTimes));
  };

  const commitEditTimes = (itemPath: number[]) => {
    const n = parseInt(editingValue, 10);
    if (!isNaN(n) && n >= 1) onUpdateTimes(itemPath, n);
    setEditingId(null);
  };

  return (
    <DroppableContainer
      id={containerId}
      items={items}
      disabled={disabled}
      blockId={blockId}
      branchKey={branchKey}
    >
      {items.map((item, i) => {
        const itemPath = [...containerPath, i];

        if (item.type === 'command') {
          return (
            <SortableItem key={item.id} id={item.id} disabled={disabled}>
              <CommandChip
                cmd={item.cmd}
                onClick={disabled ? undefined : () => onRemove(itemPath)}
              />
            </SortableItem>
          );
        }

        if (item.type === 'loop') {
          const isEditingTimes = editingId === item.id;
          return (
            <SortableItem key={item.id} id={item.id} disabled={disabled}>
              <div
                onClick={disabled ? undefined : () => onRemove(itemPath)}
                title={disabled ? undefined : 'Удалить цикл'}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '4px 8px',
                  backgroundColor: loopPalette.bg,
                  border: `1px solid ${loopPalette.border}`,
                  borderRadius: 4,
                  cursor: disabled ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: loopPalette.border,
                      fontFamily: 'monospace',
                      pointerEvents: 'none',
                    }}
                  >
                    repeat ×
                  </span>
                  {isEditingTimes ? (
                    <input
                      autoFocus
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      onBlur={() => commitEditTimes(itemPath)}
                      onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key === 'Enter') commitEditTimes(itemPath);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      style={{
                        width: 36,
                        padding: '1px 4px',
                        border: `1px solid ${loopPalette.border}`,
                        borderRadius: 3,
                        fontFamily: 'monospace',
                        fontSize: 11,
                        fontWeight: 700,
                        color: loopPalette.border,
                        background: '#fdfaf4',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={e => startEditTimes(item.id, item.times, e)}
                      onClick={e => e.stopPropagation()}
                      title="двойной клик — изменить"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: loopPalette.border,
                        fontFamily: 'monospace',
                        cursor: 'text',
                        borderBottom: `1px dashed ${loopPalette.border}`,
                      }}
                    >
                      {item.times}
                    </span>
                  )}
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <ProgramDisplay
                    items={item.body}
                    depth={depth + 1}
                    containerPath={[...itemPath]}
                    blockId={item.id}
                    branchKey="body"
                    onRemove={onRemove}
                    onUpdateTimes={onUpdateTimes}
                    disabled={disabled}
                  />
                </div>
              </div>
            </SortableItem>
          );
        }

        if (item.type === 'if') {
          return (
            <SortableItem key={item.id} id={item.id} disabled={disabled}>
              <div
                onClick={disabled ? undefined : () => onRemove(itemPath)}
                title={disabled ? undefined : 'Удалить if-блок'}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  gap: 3,
                  padding: '4px 8px',
                  backgroundColor: ifPalette.bg,
                  border: `1px solid ${ifPalette.border}`,
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  cursor: disabled ? 'default' : 'pointer',
                }}
              >
                <span style={{ fontWeight: 700, color: ifPalette.border, pointerEvents: 'none' }}>
                  if {item.condition}
                </span>
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ paddingLeft: 8, borderLeft: `2px solid ${ifPalette.border}` }}
                >
                  <div style={{ fontSize: 10, color: '#6a6a6a', marginBottom: 2 }}>then</div>
                  {item.then.length > 0 ? (
                    <ProgramDisplay
                      items={item.then}
                      depth={depth + 1}
                      containerPath={[...itemPath, 0]}
                      blockId={item.id}
                      branchKey="then"
                      onRemove={onRemove}
                      onUpdateTimes={onUpdateTimes}
                      disabled={disabled}
                    />
                  ) : (
                    <span style={{ color: '#bbb', fontSize: 10 }}>пусто</span>
                  )}
                </div>
                {item.else.length > 0 && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{ paddingLeft: 8, borderLeft: '2px solid #e08080' }}
                  >
                    <div style={{ fontSize: 10, color: '#6a6a6a', marginBottom: 2 }}>else</div>
                    <ProgramDisplay
                      items={item.else}
                      depth={depth + 1}
                      containerPath={[...itemPath, 1]}
                      blockId={item.id}
                      branchKey="else"
                      onRemove={onRemove}
                      onUpdateTimes={onUpdateTimes}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            </SortableItem>
          );
        }

        return null;
      })}
    </DroppableContainer>
  );
};
