import type { CommandKind, Position } from '../types';

export const isSame = (a: Position, b: Position): boolean => a.row === b.row && a.col === b.col;

export const move = (
  pos: Position,
  cmd: CommandKind,
  walls: Position[],
  gridSize: number,
  strict = false,
): Position | null => {
  let { row, col } = pos;
  if (cmd === 'UP') row--;
  if (cmd === 'DOWN') row++;
  if (cmd === 'LEFT') col--;
  if (cmd === 'RIGHT') col++;

  const outOfBounds = row < 0 || col < 0 || row >= gridSize || col >= gridSize;
  const hitWall = walls.some(w => isSame(w, { row, col }));

  if (outOfBounds || hitWall) return strict ? null : pos;
  return { row, col };
};
