import React, { useState, useRef } from "react";
import { Grid } from "./components/Grid";
import type { Position, Command } from "./types";

const GRID_SIZE = 8;
const STEP_DELAY = 400;

const move = (
  pos: Position,
  command: Command,
  size: number
): Position => {
  let { row, col } = pos;

  switch (command) {
    case "UP":
      row--;
      break;
    case "DOWN":
      row++;
      break;
    case "LEFT":
      col--;
      break;
    case "RIGHT":
      col++;
      break;
  }

  if (row < 0 || col < 0 || row >= size || col >= size) {
    return pos;
  }

  return { row, col };
};

const App: React.FC = () => {
  const start: Position = { row: 0, col: 0 };
  const finish: Position = { row: 7, col: 7 };

  const [robot, setRobot] = useState<Position>(start);
  const [program, setProgram] = useState<Command[]>([
    "RIGHT",
    "RIGHT",
    "DOWN",
    "DOWN",
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<number | null>(null);

  const handleCellClick = (row: number, col: number) => {
    if (isRunning) return;
    setRobot({ row, col });
  };

  const runProgram = () => {
    if (isRunning) return;

    setIsRunning(true);
    let step = 0;

    intervalRef.current = window.setInterval(() => {
      setRobot((prev) => {
        if (step >= program.length) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return prev;
        }

        const next = move(prev, program[step], GRID_SIZE);
        step++;
        return next;
      });
    }, STEP_DELAY);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
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

      <button
        onClick={runProgram}
        disabled={isRunning}
        style={{ marginTop: 20 }}
      >
        Run
      </button>
    </div>
  );
};

export default App;