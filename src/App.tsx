import React from "react";
import { Grid } from "./components/Grid";
import { Controls } from "./components/Controls";
import { ProgramPanel } from "./components/ProgramPanel";
import { MapsSidebar } from "./components/MapsSidebar";
import { useRobot } from "./hooks/useRobot";
import { useGrid } from "./hooks/useGrid";
import { useProgram } from "./hooks/useProgram";
import { useMaps } from "./hooks/useMaps";
import type { SavedMap } from "./types";

const App: React.FC = () => {
  const { start, finish, walls, wallsRef, drawMode, setDrawMode, handleCellClick, loadGrid } = useGrid();
  const { robot, isRunning, message, runProgram, reset } = useRobot(wallsRef, start, finish);
  const {
    program, editStack,
    addCommand, removeAt, clearProgram,
    loopStart, loopEnd,
    ifStart, ifElse, ifEnd,
    loadProgram,
    isInLoop, isInIf, canElse, isEditing,
  } = useProgram();
  const { maps, saveMap, deleteMap } = useMaps();

  const handleLoadMap = (map: SavedMap) => {
    loadGrid(map.start, map.finish, map.walls);
    if (map.program) loadProgram(map.program);
    reset();
  };

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
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.05em", color: "#6b5344" }}>
          robot programmer
        </div>

        <Grid
          robot={robot}
          start={start}
          finish={finish}
          walls={walls}
          isRunning={isRunning}
          onCellClick={(row, col) => { if (!isRunning) handleCellClick(row, col); }}
        />

        <Controls
          isRunning={isRunning}
          isEditing={isEditing}
          isInLoop={isInLoop}
          isInIf={isInIf}
          canElse={canElse}
          drawMode={drawMode}
          onDrawMode={setDrawMode}
          onCommand={addCommand}
          onLoopStart={loopStart}
          onLoopEnd={loopEnd}
          onIfStart={ifStart}
          onIfElse={ifElse}
          onIfEnd={ifEnd}
          onClear={clearProgram}
          onRun={() => {
            if (isEditing) { alert("Закрой открытый блок!"); return; }
            runProgram(program);
          }}
          onReset={reset}
        />

        <ProgramPanel
          program={program}
          editStack={editStack as any}
          isRunning={isRunning}
          onRemove={removeAt}
        />

        {message && (
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2a9d8f" }}>{message}</div>
        )}

        <div style={{ fontSize: 10, color: "#b0a090" }}>
          клик по ячейке — рисовать · клик по команде — удалить
        </div>
      </div>

      <div style={{ paddingTop: 38 }}>
        <MapsSidebar
          maps={maps}
          currentStart={start}
          currentFinish={finish}
          currentWalls={walls}
          currentProgram={program}
          onSave={saveMap}
          onLoad={handleLoadMap}
          onDelete={deleteMap}
        />
      </div>
    </div>
  );
};

export default App;