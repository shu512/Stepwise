import React, { useState } from "react";
import type { SavedMap, Position, ProgramItem } from "../types";

type Props = {
  maps: SavedMap[];
  currentStart: Position;
  currentFinish: Position;
  currentWalls: Position[];
  currentProgram: ProgramItem[];
  gridSize: number;
  strictWalls: boolean;
  onSave: (name: string, gridSize: number, strictWalls: boolean, start: Position, finish: Position, walls: Position[], program?: ProgramItem[]) => void;
  onLoad: (map: SavedMap) => void;
  onDelete: (id: string) => void;
  onImport: (map: SavedMap) => void;
  onRename: (id: string, name: string) => void;
  onImportBulk: () => number;
};

export const MapsSidebar: React.FC<Props> = ({
  maps, currentStart, currentFinish, currentWalls, currentProgram, gridSize, strictWalls,
  onSave, onLoad, onDelete, onImport, onRename, onImportBulk,
}) => {
  const [saveProgram, setSaveProgram] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleSave = () => {
    const name = window.prompt("Название карты:", `карта ${maps.length + 1}`);
    if (!name) return;
    onSave(name, gridSize, strictWalls, currentStart, currentFinish, currentWalls, saveProgram ? currentProgram : undefined);
  };

  const handleExport = (map: SavedMap) => {
    navigator.clipboard.writeText(JSON.stringify(map)).then(() => {
      setCopyFeedback(map.id);
      setTimeout(() => setCopyFeedback(null), 1500);
    });
  };

  const handleImport = () => {
    const raw = window.prompt("Вставь данные карты:");
    if (!raw) return;
    try {
      const map = JSON.parse(raw) as SavedMap;
      if (!map.id || !map.name || !map.gridSize || !map.start || !map.finish || !map.walls) {
        alert("Некорректные данные");
        return;
      }
      onImport({ ...map, id: Date.now().toString() });
    } catch {
      alert("Не удалось прочитать данные");
    }
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
    padding: "4px 10px", border: "1px solid #b0a090", borderRadius: 3,
    background: "#f5f0e8", cursor: "pointer", fontFamily: "monospace",
    fontSize: 12, fontWeight: 600, color: "#2a2a2a", textAlign: "left",
    ...extra,
  });

  return (
    <div style={{ width: 180, display: "flex", flexDirection: "column", gap: 8, fontFamily: "monospace", fontSize: 12, color: "#2a2a2a" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b5344", letterSpacing: "0.05em" }}>КАРТЫ</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 8, borderBottom: "1px solid #d0c8b8" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={saveProgram} onChange={e => setSaveProgram(e.target.checked)} style={{ accentColor: "#6b5344" }} />
          сохранить программу
        </label>
        <button onClick={handleSave} style={btn({ background: "#c8e6c9", borderColor: "#4caf50" })}>
          + сохранить карту
        </button>
        <button onClick={handleImport} style={btn()}>↓ импортировать</button>
        <button
          onClick={() => {
            const count = onImportBulk();
            if (count === 0) alert("Все карты уже добавлены");
            else alert(`Добавлено карт: ${count}`);
          }}
          style={btn()}
        >
          📚 карты для обучения
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", overflowX: "hidden", maxHeight: 400 }}>
        {maps.length === 0 && <span style={{ color: "#b0a090", fontSize: 11 }}>пусто</span>}
        {maps.map(map => (
          <div key={map.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {editingId === map.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
                style={{
                  flex: 1, padding: "3px 6px", border: "1px solid #a0522d", borderRadius: 3,
                  fontFamily: "monospace", fontSize: 12, background: "#fdfaf4", color: "#2a2a2a", outline: "none",
                }}
              />
            ) : (
              <button
                onClick={() => onLoad(map)}
                onDoubleClick={() => startEditing(map)}
                style={btn({ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}
                title={map.name}
              >
                {/* program dot */}
                <span style={{
                  display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                  backgroundColor: map.program && map.program.length > 0 ? "#4caf50" : "#d0c8b8",
                  marginRight: 4, flexShrink: 0, verticalAlign: "middle",
                }} title={map.program?.length ? "с программой" : "без программы"} />
                {/* strict walls dot */}
                <span style={{
                  display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                  backgroundColor: map.strictWalls ? "#e63946" : "#d0c8b8",
                  marginRight: 5, flexShrink: 0, verticalAlign: "middle",
                }} title={map.strictWalls ? "столкновения включены" : "без столкновений"} />
                {map.name}
              </button>
            )}
            <button onClick={() => handleExport(map)}
              style={btn({ padding: "4px 7px", flexShrink: 0, color: copyFeedback === map.id ? "#4caf50" : "#2a2a2a" })}
              title="Экспортировать">
              {copyFeedback === map.id ? "✓" : "↑"}
            </button>
            <button onClick={() => onDelete(map.id)}
              style={btn({ padding: "4px 7px", color: "#c0392b", flexShrink: 0 })}
              title="Удалить">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};