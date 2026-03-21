import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { COLOR_BG, COLOR_BG_LIGHT, COLOR_BORDER, COLOR_LABEL, COLOR_TEXT } from '../constants';
import type { Position, ProgramItem, SavedMap } from '../types';

type RowProps = {
  map: SavedMap;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  copyFeedback: string | null;
  onLoad: () => void;
  onStartEditing: () => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onEditingNameChange: (v: string) => void;
  onExport: () => void;
  onDelete: () => void;
  btn: (extra?: React.CSSProperties) => React.CSSProperties;
  inputStyle: React.CSSProperties;
};

const SortableMapRow: React.FC<RowProps> = ({
  map,
  isActive,
  isEditing,
  editingName,
  copyFeedback,
  onLoad,
  onStartEditing,
  onCommitEdit,
  onCancelEdit,
  onEditingNameChange,
  onExport,
  onDelete,
  btn,
  inputStyle,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: map.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        borderLeft: isActive ? '3px solid #4caf50' : '3px solid transparent',
        opacity: isDragging ? 0.4 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {isEditing ? (
        <input
          autoFocus
          value={editingName}
          onChange={e => onEditingNameChange(e.target.value)}
          onBlur={onCommitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') onCommitEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
          style={inputStyle}
        />
      ) : (
        <button
          {...attributes}
          {...listeners}
          onClick={onLoad}
          onDoubleClick={onStartEditing}
          style={btn({
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'grab',
            touchAction: 'none',
          })}
          title={map.name}
        >
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: map.program && map.program.length > 0 ? '#4caf50' : '#d0c8b8',
              marginRight: 4,
              flexShrink: 0,
              verticalAlign: 'middle',
            }}
            title={map.program?.length ? 'С программой' : 'Без программы'}
          />
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: map.strictWalls ? '#e63946' : '#d0c8b8',
              marginRight: 5,
              flexShrink: 0,
              verticalAlign: 'middle',
            }}
            title={map.strictWalls ? 'Столкновения включены' : 'Без столкновений'}
          />
          {map.name}
        </button>
      )}
      <button
        onClick={onExport}
        style={btn({
          padding: '4px 7px',
          flexShrink: 0,
          color: copyFeedback === map.id ? '#4caf50' : COLOR_TEXT,
        })}
        title="Экспортировать"
      >
        {copyFeedback === map.id ? '✓' : '↑'}
      </button>
      <button
        onClick={onDelete}
        style={btn({ padding: '4px 7px', color: '#c0392b', flexShrink: 0 })}
        title="Удалить"
      >
        ✕
      </button>
    </div>
  );
};

type Props = {
  maps: SavedMap[];
  activeMapId: string | null;
  currentStart: Position;
  currentFinish: Position;
  currentWalls: Position[];
  currentProgram: ProgramItem[];
  gridSize: number;
  strictWalls: boolean;
  onSave: (
    name: string,
    gridSize: number,
    strictWalls: boolean,
    start: Position,
    finish: Position,
    walls: Position[],
    program?: ProgramItem[],
  ) => void;
  onLoad: (map: SavedMap) => void;
  onDelete: (id: string) => void;
  onImport: (map: SavedMap) => void;
  onRename: (id: string, name: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onImportBulk: () => number;
};

export const MapsSidebar: React.FC<Props> = ({
  maps,
  activeMapId,
  currentStart,
  currentFinish,
  currentWalls,
  currentProgram,
  gridSize,
  strictWalls,
  onSave,
  onLoad,
  onDelete,
  onImport,
  onRename,
  onReorder,
  onImportBulk,
}) => {
  const [saveProgram, setSaveProgram] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSaveStart = () => {
    setSaving(true);
    setSaveName(`Карта ${maps.length + 1}`);
  };
  const handleSaveCommit = () => {
    if (!saveName.trim()) return;
    onSave(
      saveName.trim(),
      gridSize,
      strictWalls,
      currentStart,
      currentFinish,
      currentWalls,
      saveProgram ? currentProgram : undefined,
    );
    setSaving(false);
    setSaveName('');
  };
  const handleSaveCancel = () => {
    setSaving(false);
    setSaveName('');
  };

  const handleExport = (map: SavedMap) => {
    navigator.clipboard.writeText(JSON.stringify(map)).then(() => {
      setCopyFeedback(map.id);
      setTimeout(() => setCopyFeedback(null), 1500);
    });
  };

  const handleImport = () => {
    const raw = window.prompt('Вставь данные карты:');
    if (!raw) return;
    try {
      const map = JSON.parse(raw) as SavedMap;
      if (!map.id || !map.name || !map.gridSize || !map.start || !map.finish || !map.walls) {
        alert('Некорректные данные');
        return;
      }
      onImport({ ...map, id: Date.now().toString() });
    } catch {
      alert('Не удалось прочитать данные');
    }
  };

  const handleImportBulk = () => {
    const count = onImportBulk();
    setBulkFeedback(count === 0 ? 'Все карты уже добавлены' : `Добавлено: ${count}`);
    setTimeout(() => setBulkFeedback(null), 2500);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
  };

  const commitEdit = () => {
    if (editingId && editingName.trim()) onRename(editingId, editingName.trim());
    setEditingId(null);
  };

  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '4px 10px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#b0a090',
    borderRadius: 3,
    background: COLOR_BG,
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 600,
    color: COLOR_TEXT,
    textAlign: 'left',
    ...extra,
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '3px 6px',
    border: '1px solid #a0522d',
    borderRadius: 3,
    fontFamily: 'monospace',
    fontSize: 12,
    background: COLOR_BG_LIGHT,
    color: COLOR_TEXT,
    outline: 'none',
  };

  return (
    <div
      style={{
        width: 180,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'monospace',
        fontSize: 12,
        color: COLOR_TEXT,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: COLOR_LABEL, letterSpacing: '0.05em' }}>
        КАРТЫ
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          paddingBottom: 8,
          borderBottom: '1px solid #d0c8b8',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={saveProgram}
            onChange={e => setSaveProgram(e.target.checked)}
            style={{ accentColor: COLOR_LABEL }}
          />
          С программой
        </label>

        {saving ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <input
              autoFocus
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveCommit();
                if (e.key === 'Escape') handleSaveCancel();
              }}
              style={{ ...inputStyle, flex: 'unset' }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={handleSaveCommit}
                disabled={!saveName.trim()}
                style={btn({ flex: 1, background: '#c8e6c9', borderColor: '#4caf50' })}
              >
                ✓ Сохранить
              </button>
              <button onClick={handleSaveCancel} style={btn({ padding: '4px 8px' })}>
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSaveStart}
            style={btn({ background: '#c8e6c9', borderColor: '#4caf50' })}
          >
            + Сохранить карту {saveProgram ? 'с программой' : 'без программы'}
          </button>
        )}

        <button onClick={handleImport} style={btn()}>
          ↓ Импортировать
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={handleImportBulk} style={btn({ width: '100%' })}>
            📚 Карты для обучения
          </button>
          {bulkFeedback && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 2,
                padding: '3px 6px',
                background: '#f0ebe0',
                border: '1px solid #b0a090',
                borderRadius: 3,
                fontSize: 11,
                color: COLOR_LABEL,
                textAlign: 'center',
                zIndex: 10,
              }}
            >
              {bulkFeedback}
            </div>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={maps.map(m => m.id)} strategy={verticalListSortingStrategy}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight:
                'calc(100vh - 187px)' /* app padding (24) + sidebar padding (8) + sidebar header (13) + sidebar actions (126) + sidebar gaps (16) */,
            }}
          >
            {maps.length === 0 && <span style={{ color: COLOR_BORDER, fontSize: 11 }}>пусто</span>}
            {maps.map(map => (
              <SortableMapRow
                key={map.id}
                map={map}
                isActive={map.id === activeMapId}
                isEditing={editingId === map.id}
                editingName={editingName}
                copyFeedback={copyFeedback}
                onLoad={() => onLoad(map)}
                onStartEditing={() => {
                  setEditingId(map.id);
                  setEditingName(map.name);
                }}
                onCommitEdit={commitEdit}
                onCancelEdit={() => setEditingId(null)}
                onEditingNameChange={setEditingName}
                onExport={() => handleExport(map)}
                onDelete={() => onDelete(map.id)}
                btn={btn}
                inputStyle={inputStyle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
