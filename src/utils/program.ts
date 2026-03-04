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

export const countSteps = (items: ProgramItem[]): number => {
  let count = 0;
  for (const item of items) {
    if (typeof item === "string") {
      count += 1;
    } else if (item.type === "loop") {
      count += item.times * countSteps(item.body);
    } else if (item.type === "if") {
      count += Math.max(countSteps(item.then), countSteps(item.else));
    }
  }
  return count;
};

export const removeAtPath = (
  items: ProgramItem[],
  path: number[]
): ProgramItem[] => {
  const [head, ...tail] = path;
  if (tail.length === 0) {
    return items.filter((_, i) => i !== head);
  }
  return items.map((item, i) => {
    if (i !== head) return item;
    if (typeof item === "string") return item;
    if (item.type === "loop") {
      return { ...item, body: removeAtPath(item.body, tail) };
    }
    if (item.type === "if") {
      // tail[0] === 0 = then, 1 = else
      if (tail[0] === 0) return { ...item, then: removeAtPath(item.then, tail.slice(1)) };
      if (tail[0] === 1) return { ...item, else: removeAtPath(item.else, tail.slice(1)) };
    }
    return item;
  });
};
