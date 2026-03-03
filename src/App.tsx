import React from "react";
import { Grid } from "./components/Grid";
import { Controls } from "./components/Controls";
import { ProgramDisplay } from "./components/ProgramDisplay";
import { MapsSidebar } from "./components/MapsSidebar";
import { useRobot } from "./hooks/useRobot";
import { useGrid } from "./hooks/useGrid";
import { useProgram } from "./hooks/useProgram";
import { useMaps } from "./hooks/useMaps";
import { LOOP_COLORS } from "./constants";
import { flatten } from "./utils/program";
import type { SavedMap } from "./types";

const App: React.FC = () => {
  const { start, finish, walls, wallsRef, drawMode, setDrawMode, handleCellClick, loadGrid } = useGrid();
  const { robot, isRunning, message, runProgram, reset } = useRobot(wallsRef, start, finish);
  const {
    editStack, addCommand, removeAt,
    undo, clearProgram, loopStart, loopEnd, loadProgram, isInLoop,
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
      gap: 24,
      padding: 24,
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
          isInLoop={isInLoop}
          drawMode={drawMode}
          onDrawMode={setDrawMode}
          onCommand={addCommand}
          onLoopStart={loopStart}
          onLoopEnd={loopEnd}
          onUndo={undo}
          onClear={clearProgram}
          onRun={() => {
            if (isInLoop) { alert("Закрой цикл (LOOP END)!"); return; }
            runProgram(editStack[0]);
          }}
          onReset={reset}
        />

        {isInLoop && (
          <div style={{
            fontSize: 12, color: "#a0522d",
            border: "1px dashed #a0522d",
            padding: "4px 10px", borderRadius: 3,
          }}>
            записываю тело цикла (глубина {editStack.length - 1}) — нажми LOOP END
          </div>
        )}

        <div style={{
          width: "100%", maxWidth: 500, minHeight: 56,
          border: "1px solid #b0a090",
          borderRadius: 3, padding: 10,
          background: "#fdfaf4",
        }}>
          <div style={{ fontSize: 10, color: "#a09080", marginBottom: 6, letterSpacing: "0.06em" }}>
            ПРОГРАММА {editStack[0].length > 0 && `· ${flatten(editStack[0]).length} шагов`}
          </div>

          {editStack[0].length > 0
            ? <ProgramDisplay items={editStack[0]} depth={0} onRemove={isRunning ? undefined : removeAt} />
            : <span style={{ color: "#c0b0a0", fontSize: 12 }}>пусто</span>
          }

          {editStack.slice(1).map((ctx, i) => {
            const palette = LOOP_COLORS[(i + 1) % LOOP_COLORS.length];
            return (
              <div key={i} style={{
                marginTop: 8, padding: "6px 8px",
                border: `1px dashed ${palette.border}`,
                borderRadius: 3, background: palette.bg,
              }}>
                <div style={{ fontSize: 10, color: palette.border, marginBottom: 4, fontWeight: 700 }}>
                  тело цикла — уровень {i + 1}
                </div>
                {ctx.length > 0
                  ? <ProgramDisplay items={ctx} depth={i + 1} />
                  : <span style={{ color: "#999", fontSize: 11 }}>пусто</span>
                }
              </div>
            );
          })}
        </div>

        {message && (
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2a9d8f" }}>{message}</div>
        )}

        <div style={{ fontSize: 10, color: "#b0a090" }}>
          клик по ячейке — рисовать · клик по команде — удалить
        </div>
      </div>

      {/* Сайдбар */}
      <div style={{ paddingTop: 38 }}>
        <MapsSidebar
          maps={maps}
          currentStart={start}
          currentFinish={finish}
          currentWalls={walls}
          currentProgram={editStack[0]}
          onSave={saveMap}
          onLoad={handleLoadMap}
          onDelete={deleteMap}
        />
      </div>
    </div>
  );
};

export default App;