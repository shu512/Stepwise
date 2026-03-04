import React from "react";
import { Cell } from "./Cell";
import type { Position, CellKind } from "../types";
import { GRID_SIZE } from "../constants";
import { isSame } from "../utils/program";

type Props = {
  robot: Position;
  start: Position;
  finish: Position;
  walls: Position[];
  isRunning: boolean;
  isManual: boolean;
  onCellClick: (row: number, col: number) => void;
};

export const Grid: React.FC<Props> = ({ robot, start, finish, walls, isRunning, isManual, onCellClick }) => {
  const cells = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = { row, col };
      let type: CellKind = "empty";
      if (isSame(robot, current) && isRunning)      type = "robot";
      else if (isSame(start, current))              type = "start";
      else if (isSame(finish, current))             type = "finish";
      else if (walls.some(w => isSame(w, current))) type = "wall";

      cells.push(
        <Cell 
          key={`${row}-${col}`} 
          type={type} 
          isRunning={isRunning}
          isManual={isManual}
          onClick={() => onCellClick(row, col)}
        />
      );
    }
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${GRID_SIZE}, 48px)`,
      border: "1px solid #b0a090",
    }}>
      {cells}
    </div>
  );
};