import type { Position, Command, ProgramItem } from '../types';

export const isSame = (a: Position, b: Position) => a.row === b.row && a.col === b.col;

export const move = (
  pos: Position,
  cmd: Command,
  walls: Position[],
  gridSize: number,
  strict: boolean = false,
): Position | null => {
  let { row, col } = pos;
  if (cmd === 'UP') row--;
  if (cmd === 'DOWN') row++;
  if (cmd === 'LEFT') col--;
  if (cmd === 'RIGHT') col++;

  const outOfBounds = row < 0 || col < 0 || row >= gridSize || col >= gridSize;
  const hitWall = walls.some(w => isSame(w, { row, col }));

  if (outOfBounds || hitWall) {
    return strict ? null : pos; // null = bump
  }

  return { row, col };
};

export const countSteps = (items: ProgramItem[]): number => {
  let count = 0;
  for (const item of items) {
    if (typeof item === 'string') {
      count += 1;
    } else if (item.type === 'loop') {
      count += item.times * countSteps(item.body);
    } else if (item.type === 'if') {
      count += Math.max(countSteps(item.then), countSteps(item.else));
    }
  }
  return count;
};

export const removeAtPath = (items: ProgramItem[], path: number[]): ProgramItem[] => {
  const [head, ...tail] = path;
  if (tail.length === 0) {
    return items.filter((_, i) => i !== head);
  }
  return items.map((item, i) => {
    if (i !== head) return item;
    if (typeof item === 'string') return item;
    if (item.type === 'loop') {
      return { ...item, body: removeAtPath(item.body, tail) };
    }
    if (item.type === 'if') {
      // tail[0] === 0 = then, 1 = else
      if (tail[0] === 0) return { ...item, then: removeAtPath(item.then, tail.slice(1)) };
      if (tail[0] === 1) return { ...item, else: removeAtPath(item.else, tail.slice(1)) };
    }
    return item;
  });
};

export const updateLoopTimes = (
  items: ProgramItem[],
  path: number[],
  times: number,
): ProgramItem[] => {
  const [head, ...tail] = path;
  return items.map((item, i) => {
    if (i !== head) return item;
    if (typeof item === 'string') return item;
    if (tail.length === 0 && item.type === 'loop') {
      return { ...item, times };
    }
    if (item.type === 'loop') {
      return { ...item, body: updateLoopTimes(item.body, tail, times) };
    }
    if (item.type === 'if') {
      if (tail[0] === 0) return { ...item, then: updateLoopTimes(item.then, tail.slice(1), times) };
      if (tail[0] === 1) return { ...item, else: updateLoopTimes(item.else, tail.slice(1), times) };
    }
    return item;
  });
};
