import React from "react";
import { Cell } from "./Cell";
import type { Position } from "../types";

type Props = {
  size: number;
  robot: Position | null;
  start: Position;
  finish: Position;
  onCellClick: (row: number, col: number) => void;
};

export const Grid: React.FC<Props> = ({
  size,
  robot,
  start,
  finish,
  onCellClick,
}) => {
  const cells = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let type: "empty" | "robot" | "start" | "finish" = "empty";

      if (robot?.row === row && robot?.col === col) {
        type = "robot";
      } else if (start.row === row && start.col === col) {
        type = "start";
      } else if (finish.row === row && finish.col === col) {
        type = "finish";
      }

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