import React from "react";
import { Cell } from "./Cell";
import type { Position, CellKind } from "../types";

type Props = {
  size: number;
  robot: Position;
  start: Position;
  finish: Position;
  walls: Position[];
  onCellClick: (row: number, col: number) => void;
};

const isSame = (a: Position, b: Position) =>
  a.row === b.row && a.col === b.col;

export const Grid: React.FC<Props> = ({
  size,
  robot,
  start,
  finish,
  walls,
  onCellClick,
}) => {
  const cells = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const current = { row, col };

      let type: CellKind = "empty";

      if (isSame(robot, current)) type = "robot";
      else if (isSame(start, current)) type = "start";
      else if (isSame(finish, current)) type = "finish";
      else if (walls.some(w => isSame(w, current))) type = "wall";

      cells.push(
        <Cell
          key={`${row}-${col}`}
          type={type}
          onClick={() => onCellClick(row, col)}
        />
      );
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${size}, 50px)`,
      }}
    >
      {cells}
    </div>
  );
};