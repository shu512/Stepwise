import React, { useState } from "react";
import type { SavedMap, Position, ProgramItem } from "../types";

type Props = {
  maps: SavedMap[];
  currentStart: Position;
  currentFinish: Position;
  currentWalls: Position[];
  currentProgram: ProgramItem[];
  gridSize: number;
  onSave: (name: string, gridSize: number, start: Position, finish: Position, walls: Position[], program?: ProgramItem[]) => void;
  onLoad: (map: SavedMap) => void;
  onDelete: (id: string) => void;
  onImport: (map: SavedMap) => void;
};

export const MapsSidebar: React.FC<Props> = ({
  maps, currentStart, currentFinish, currentWalls, currentProgram, gridSize,
  onSave, onLoad, onDelete, onImport,
}) => {
  const [saveProgram, setSaveProgram] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleSave = () => {
    const name = window.prompt("Название карты:", `карта ${maps.length + 1}`);
    if (!name) return;
    onSave(name, gridSize, currentStart, currentFinish, currentWalls, saveProgram ? currentProgram : undefined);
  };

  const handleExport = (map: SavedMap) => {
    const json = JSON.stringify(map);
    navigator.clipboard.writeText(json).then(() => {
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

  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "4px 10px",
    border: "1px solid #b0a090",
    borderRadius: 3,
    background: "#f5f0e8",
    cursor: "pointer",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: 600,
    color: "#2a2a2a",
    textAlign: "left",
    ...extra,
  });

  return (
    <div style={{
      width: 180,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      fontFamily: "monospace",
      fontSize: 12,
      color: "#2a2a2a",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b5344", letterSpacing: "0.05em" }}>
        КАРТЫ
      </div>

      {/* Сохранить */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 8, borderBottom: "1px solid #d0c8b8" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={saveProgram}
            onChange={e => setSaveProgram(e.target.checked)}
            style={{ accentColor: "#6b5344" }}
          />
          сохранить программу
        </label>
        <button onClick={handleSave} style={btn({ background: "#c8e6c9", borderColor: "#4caf50" })}>
          + сохранить карту
        </button>
        <button onClick={handleImport} style={btn()}>
          ↓ импортировать
        </button>
      </div>

      {/* Список */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", maxHeight: 400 }}>
        {maps.length === 0 && (
          <span style={{ color: "#b0a090", fontSize: 11 }}>пусто</span>
        )}
        {maps.map(map => (
          <div key={map.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => onLoad(map)}
              style={btn({ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}
              title={map.name}
            >
              <span style={{
                display: "inline-block", width: 8, height: 8,
                borderRadius: "50%",
                backgroundColor: map.program && map.program.length > 0 ? "#4caf50" : "#b0a090",
                marginRight: 6, flexShrink: 0,
              }} />
              {map.name}
            </button>
            <button
              onClick={() => handleExport(map)}
              style={btn({ padding: "4px 7px", flexShrink: 0, color: copyFeedback === map.id ? "#4caf50" : "#2a2a2a" })}
              title="Экспортировать"
            >
              {copyFeedback === map.id ? "✓" : "↑"}
            </button>
            <button
              onClick={() => onDelete(map.id)}
              style={btn({ padding: "4px 7px", color: "#c0392b", flexShrink: 0 })}
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