import React, { useState } from "react";
import { Grid } from "./components/Grid";
import type { Position } from "./types";

const GRID_SIZE = 8;

const App: React.FC = () => {
  const start: Position = { row: 0, col: 0 };
  const finish: Position = { row: 7, col: 7 };

  const [robot, setRobot] = useState<Position | null>(null);

  const handleCellClick = (row: number, col: number) => {
    if (
      (row === start.row && col === start.col) ||
      (row === finish.row && col === finish.col)
    ) {
      return;
    }

    setRobot((prev) => {
      if (prev && prev.row === row && prev.col === col) {
        return null;
      }
      return { row, col };
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Grid
        size={GRID_SIZE}
        robot={robot}
        start={start}
        finish={finish}
        onCellClick={handleCellClick}
      />
    </div>
  );
};

export default App;