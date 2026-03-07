import React, { useState } from 'react';
import type { ProgramItem } from '../types';
import { LOOP_COLORS } from '../constants';
import { CommandChip } from './CommandChip';

const IF_COLORS = [
  { bg: '#fff8e8', border: '#c0a030' },
  { bg: '#f0f8ff', border: '#4a90d9' },
];

type Props = {
  items: ProgramItem[];
  depth?: number;
  path?: number[];
  onRemove?: (path: number[]) => void;
  onUpdateTimes?: (path: number[], times: number) => void;
};

export const ProgramDisplay: React.FC<Props> = ({
  items,
  depth = 0,
  path = [],
  onRemove,
  onUpdateTimes,
}) => {
  const loopPalette = LOOP_COLORS[depth % LOOP_COLORS.length];
  const ifPalette = IF_COLORS[depth % IF_COLORS.length];

  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const startEditTimes = (itemPath: number[], currentTimes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPath(itemPath.join('-'));
    setEditingValue(String(currentTimes));
  };

  const commitEditTimes = (itemPath: number[]) => {
    const n = parseInt(editingValue, 10);
    if (!isNaN(n) && n >= 1 && onUpdateTimes) {
      onUpdateTimes(itemPath, n);
    }
    setEditingPath(null);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
      {items.map((item, i) => {
        const itemPath = [...path, i];
        const pathKey = itemPath.join('-');

        if (typeof item === 'string') {
          return (
            <CommandChip
              key={i}
              cmd={item}
              onClick={onRemove ? () => onRemove(itemPath) : undefined}
            />
          );
        }

        if (item.type === 'loop') {
          const isEditingTimes = editingPath === pathKey;

          return (
            <div
              key={i}
              onClick={onRemove ? () => onRemove(itemPath) : undefined}
              title={onRemove ? 'Удалить цикл' : undefined}
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 4,
                padding: '4px 8px',
                backgroundColor: loopPalette.bg,
                border: `1px solid ${loopPalette.border}`,
                borderRadius: 4,
                cursor: onRemove ? 'pointer' : 'default',
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
                      if (e.key === 'Escape') setEditingPath(null);
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
                    onDoubleClick={e =>
                      onUpdateTimes ? startEditTimes(itemPath, item.times, e) : undefined
                    }
                    onClick={e => e.stopPropagation()}
                    title={onUpdateTimes ? 'двойной клик — изменить' : undefined}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: loopPalette.border,
                      fontFamily: 'monospace',
                      cursor: onUpdateTimes ? 'text' : 'default',
                      borderBottom: onUpdateTimes ? `1px dashed ${loopPalette.border}` : 'none',
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
                  path={itemPath}
                  onRemove={onRemove}
                  onUpdateTimes={onUpdateTimes}
                />
              </div>
            </div>
          );
        }

        if (item.type === 'if') {
          return (
            <div
              key={i}
              onClick={onRemove ? () => onRemove(itemPath) : undefined}
              title={onRemove ? 'Удалить if-блок' : undefined}
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
                cursor: onRemove ? 'pointer' : 'default',
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
                    path={[...itemPath, 0]}
                    onRemove={onRemove}
                    onUpdateTimes={onUpdateTimes}
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
                    path={[...itemPath, 1]}
                    onRemove={onRemove}
                    onUpdateTimes={onUpdateTimes}
                  />
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
