import { useRef, useState } from 'react';
import { DEFAULT_START } from '../constants';
import type { DrawMode, Position } from '../types';
import { isSame } from '../utils/grid';

export const useGrid = (gridSize: number) => {
  const [start, setStart] = useState<Position>(DEFAULT_START);
  const [finish, setFinish] = useState<Position>({ row: gridSize - 1, col: gridSize - 1 });
  const [walls, setWalls] = useState<Position[]>([]);
  const wallsRef = useRef<Position[]>([]);
  const [drawMode, setDrawMode] = useState<DrawMode>('wall');

  const setWallsSync = (next: Position[]) => {
    wallsRef.current = next;
    setWalls(next);
  };

  const resetGrid = (newSize: number) => {
    setStart(DEFAULT_START);
    setFinish({ row: newSize - 1, col: newSize - 1 });
    setWallsSync([]);
  };

  const handleCellClick = (row: number, col: number) => {
    const pos = { row, col };

    if (drawMode === 'start') {
      if (isSame(pos, finish)) return;
      setWallsSync(walls.filter(w => !isSame(w, pos)));
      setStart(pos);
      return;
    }

    if (drawMode === 'finish') {
      if (isSame(pos, start)) return;
      setWallsSync(walls.filter(w => !isSame(w, pos)));
      setFinish(pos);
      return;
    }

    if (isSame(pos, start) || isSame(pos, finish)) return;
    setWallsSync(
      walls.some(w => isSame(w, pos)) ? walls.filter(w => !isSame(w, pos)) : [...walls, pos],
    );
  };

  const loadGrid = (newStart: Position, newFinish: Position, newWalls: Position[]) => {
    setStart(newStart);
    setFinish(newFinish);
    setWallsSync(newWalls);
  };

  return {
    start,
    finish,
    walls,
    wallsRef,
    drawMode,
    setDrawMode,
    handleCellClick,
    loadGrid,
    resetGrid,
  };
};
