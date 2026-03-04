import React, { useState } from "react";
import { CodePanel } from "./components/CodePanel";
import { Controls } from "./components/Controls";
import { Grid } from "./components/Grid";
import { MapsSidebar } from "./components/MapsSidebar";
import { ProgramPanel } from "./components/ProgramPanel";
import { useGrid } from "./hooks/useGrid";
import { useMaps } from "./hooks/useMaps";
import { useProgram } from "./hooks/useProgram";
import { useRobot } from "./hooks/useRobot";
import type { DrawMode, SavedMap } from "./types";

const App: React.FC = () => {
  const { start, finish, walls, wallsRef, drawMode, setDrawMode, handleCellClick, loadGrid } = useGrid();
  const { robot, isRunning, message, runProgram, reset, teleport } = useRobot(wallsRef, start, finish);
  const {
    program, editStack,
    addCommand, removeAt, clearProgram,
    loopStart, loopEnd,
    ifStart, ifElse, ifEnd,
    loadProgram,
    isInLoop, isInIf, canElse, isEditing,
  } = useProgram();
  const { maps, saveMap, deleteMap, importMap } = useMaps();
  
  const [showCode, setShowCode] = useState(false);
  const [showCTranslation, setShowCTranslation] = useState(false);
  const [showMaps, setShowMaps] = useState(false);
  const [showDraw, setShowDraw] = useState(false);
  const [showManual, setShowManual] = useState(true);

  const maybeEnableManual = (code: boolean, translation: boolean, draw: boolean) => {
    if (!code && !translation && !draw) setShowManual(true);
  };

  const handleShowCode = (v: boolean) => {
    setShowCode(v);
    if (v) setShowManual(false);
    else maybeEnableManual(v, showCTranslation, showDraw);
  };

  const handleShowCTranslation = (v: boolean) => {
    setShowCTranslation(v);
    if (v) setShowManual(false);
    else maybeEnableManual(showCode, v, showDraw);
  };

  const handleShowDraw = (v: boolean) => {
    setShowDraw(v);
    if (v) setShowManual(false);
    else maybeEnableManual(showCode, showCTranslation, v);
  };

  const handleShowManual = (v: boolean) => {
    setShowManual(v);
    if (v) {
      setShowCode(false);
      setShowCTranslation(false);
      setShowDraw(false);
      reset();
    } else {
      setShowDraw(true);
    }
  };

  const handleLoadMap = (map: SavedMap) => {
    loadGrid(map.start, map.finish, map.walls);
    if (map.program) loadProgram(map.program);
    reset();
  };

  const checkbox = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <label style={{
      display: "flex", alignItems: "center", gap: 5,
      fontSize: 11, color: "#6b5344", cursor: "pointer", userSelect: "none",
      fontFamily: "monospace",
    }}>
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: "#6b5344" }}
      />
      {label}
    </label>
  );

  const DRAW_MODES: { mode: DrawMode; label: string; color: string }[] = [
    { mode: "wall",   label: "стена",  color: "#6b5344" },
    { mode: "start",  label: "старт",  color: "#457b9d" },
    { mode: "finish", label: "финиш",  color: "#2a9d8f" },
  ];

  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px", border: "1px solid #b0a090", borderRadius: 3,
    background: "#f5f0e8", cursor: "pointer", fontFamily: "monospace",
    fontSize: 13, fontWeight: 600, color: "#2a2a2a", ...extra,
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f0e8",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      gap: 24, padding: 24,
      fontFamily: "monospace",
      color: "#2a2a2a",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

        {/* Чекбоксы */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {checkbox("код", showCode, handleShowCode)}
          {checkbox("перевод на C", showCTranslation, handleShowCTranslation)}
          {checkbox("карты", showMaps, setShowMaps)}
          {checkbox("рисование", showDraw, handleShowDraw)}
          {checkbox("ручное управление", showManual, handleShowManual)}
        </div>

        {/* Режим рисования */}
        {showDraw && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#a09080" }}>рисовать:</span>
            {DRAW_MODES.map(({ mode, label, color }) => (
              <button
                key={mode}
                onClick={() => setDrawMode(mode)}
                style={btn({
                  color,
                  borderColor: drawMode === mode ? color : "#b0a090",
                  background: drawMode === mode ? "#fdfaf4" : "#f0ebe0",
                  fontWeight: drawMode === mode ? 700 : 500,
                  boxShadow: drawMode === mode ? `inset 0 -2px 0 ${color}` : "none",
                })}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <Grid
          robot={robot}
          start={start}
          finish={finish}
          walls={walls}
          isRunning={isRunning || showManual}
          isManual={showManual}
          onCellClick={(row, col) => {
            if (showManual) {
              teleport({ row, col });
              return;
            }
            if (showDraw && !isRunning) {
              handleCellClick(row, col);
              return;
            }
          }}
        />

        {showCode && (
          <Controls
            isRunning={isRunning}
            isEditing={isEditing}
            isInLoop={isInLoop}
            isInIf={isInIf}
            canElse={canElse}
            onCommand={addCommand}
            onLoopStart={loopStart}
            onLoopEnd={loopEnd}
            onIfStart={ifStart}
            onIfElse={ifElse}
            onIfEnd={ifEnd}
            hasProgram={program.length > 0}
            onClear={clearProgram}
            onRun={() => {
              if (isEditing) { alert("Закрой открытый блок!"); return; }
              runProgram(program);
            }}
            onReset={reset}
          />
        )}

        {isEditing && showCode && (
          <div style={{
            fontSize: 12, color: "#a0522d",
            border: "1px dashed #a0522d",
            padding: "4px 10px", borderRadius: 3,
          }}>
            записываю тело блока (глубина {editStack.length - 1}) — закрой блок
          </div>
        )}

        {showCode && (
          <ProgramPanel
            program={program}
            editStack={editStack as any}
            isRunning={isRunning}
            onRemove={removeAt}
          />
        )}

        {showCTranslation && (
          <CodePanel program={program} />
        )}

        {message && (
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2a9d8f" }}>{message}</div>
        )}

        <div style={{ fontSize: 10, color: "#b0a090" }}>
          {showManual
            ? "клик по клетке — переместить робота"
            : showDraw
              ? "клик по ячейке — рисовать"
              : "клик по команде — удалить"
          }
        </div>
      </div>

      {showMaps && (
        <div style={{ paddingTop: 8 }}>
          <MapsSidebar
            maps={maps}
            currentStart={start}
            currentFinish={finish}
            currentWalls={walls}
            currentProgram={program}
            onSave={saveMap}
            onLoad={handleLoadMap}
            onDelete={deleteMap}
            onImport={importMap}
          />
        </div>
      )}
    </div>
  );
};

export default App;