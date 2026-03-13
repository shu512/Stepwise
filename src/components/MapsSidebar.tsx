import { useState } from 'react';
import { COLOR_BG, COLOR_BG_LIGHT, COLOR_BORDER, COLOR_LABEL, COLOR_TEXT } from '../constants';
import type { Position, ProgramItem, SavedMap } from '../types';

type Props = {
  maps: SavedMap[];
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
  onImportBulk: () => number;
};

export const MapsSidebar: React.FC<Props> = ({
  maps,
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
  onImportBulk,
}) => {
  const [saveProgram, setSaveProgram] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  const handleSaveStart = () => {
    setSaving(true);
    setSaveName(`карта ${maps.length + 1}`);
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
    const msg = count === 0 ? 'Все карты уже добавлены' : `Добавлено: ${count}`;
    setBulkFeedback(msg);
    setTimeout(() => setBulkFeedback(null), 2500);
  };

  const startEditing = (map: SavedMap) => {
    setEditingId(map.id);
    setEditingName(map.name);
  };

  const commitEdit = () => {
    if (editingId && editingName.trim()) onRename(editingId, editingName.trim());
    setEditingId(null);
  };

  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '4px 10px',
    border: '1px solid #b0a090',
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

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: 400,
        }}
      >
        {maps.length === 0 && <span style={{ color: COLOR_BORDER, fontSize: 11 }}>пусто</span>}
        {maps.map(map => (
          <div key={map.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {editingId === map.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                style={inputStyle}
              />
            ) : (
              <button
                onClick={() => onLoad(map)}
                onDoubleClick={() => startEditing(map)}
                style={btn({
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
              onClick={() => handleExport(map)}
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
              onClick={() => onDelete(map.id)}
              style={btn({ padding: '4px 7px', color: '#c0392b', flexShrink: 0 })}
              title="Удалить"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
