import React from "react";
import { Grid } from "./components/Grid";
import { Controls } from "./components/Controls";
import { ProgramDisplay } from "./components/ProgramDisplay";
import { useRobot } from "./hooks/useRobot";
import { useWalls } from "./hooks/useWalls";
import { useProgram } from "./hooks/useProgram";
import { LOOP_COLORS } from "./constants";
import { flatten } from "./utils/program";

const NOTEBOOK_BG: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f5f0e8",
  backgroundSize: "48px 48px",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  gap: 16, padding: 24,
  fontFamily: "monospace",
  color: "#2a2a2a",
};

const App: React.FC = () => {
  const { walls, wallsRef, toggleWall } = useWalls();
  const { robot, isRunning, message, runProgram, reset } = useRobot(wallsRef);
  const {
    editStack, addCommand, removeAt,
    undo, clearProgram, loopStart, loopEnd, isInLoop,
  } = useProgram();

  return (
    <div style={NOTEBOOK_BG}>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.05em", color: "#6b5344" }}>
        robot programmer
      </div>

      <Grid robot={robot} walls={walls} onCellClick={toggleWall} />

      <Controls
        isRunning={isRunning}
        isInLoop={isInLoop}
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
        width: "100%", maxWidth: 600, minHeight: 56,
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
        клик по ячейке — стена · клик по команде — удалить
      </div>
    </div>
  );
};

export default App;