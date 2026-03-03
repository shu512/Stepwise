import type { Position, Command, ProgramItem } from "../types";
import { GRID_SIZE } from "../constants";

export const isSame = (a: Position, b: Position) =>
  a.row === b.row && a.col === b.col;

export const move = (pos: Position, cmd: Command, walls: Position[]): Position => {
  let { row, col } = pos;
  if (cmd === "UP")    row--;
  if (cmd === "DOWN")  row++;
  if (cmd === "LEFT")  col--;
  if (cmd === "RIGHT") col++;
  if (row < 0 || col < 0 || row >= GRID_SIZE || col >= GRID_SIZE) return pos;
  const next = { row, col };
  if (walls.some(w => isSame(w, next))) return pos;
  return next;
};

export const flatten = (items: ProgramItem[]): Command[] => {
  const result: Command[] = [];
  for (const item of items) {
    if (typeof item === "string") {
      result.push(item);
    } else {
      for (let i = 0; i < item.times; i++) {
        result.push(...flatten(item.body));
      }
    }
  }
  return result;
};