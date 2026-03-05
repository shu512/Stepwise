import { useState, useRef } from 'react';
import type { Position, DrawMode } from '../types';
import { DEFAULT_START } from '../constants';
import { isSame } from '../utils/program';

export const useGrid = (gridSize: number) => {
  const defaultFinish = (): Position => ({ row: gridSize - 1, col: gridSize - 1 });

  const [start, setStart] = useState<Position>(DEFAULT_START);
  const [finish, setFinish] = useState<Position>(defaultFinish());
  const [walls, setWalls] = useState<Position[]>([]);
  const wallsRef = useRef<Position[]>([]);
  const [drawMode, setDrawMode] = useState<DrawMode>('wall');

  const resetGrid = (newSize: number) => {
    setStart(DEFAULT_START);
    setFinish({ row: newSize - 1, col: newSize - 1 });
    setWalls([]);
    wallsRef.current = [];
  };

  const handleCellClick = (row: number, col: number) => {
    const pos = { row, col };

    if (drawMode === 'start') {
      if (isSame(pos, finish)) return;
      setWalls(prev => {
        const next = prev.filter(w => !isSame(w, pos));
        wallsRef.current = next;
        return next;
      });
      setStart(pos);
      return;
    }

    if (drawMode === 'finish') {
      if (isSame(pos, start)) return;
      setWalls(prev => {
        const next = prev.filter(w => !isSame(w, pos));
        wallsRef.current = next;
        return next;
      });
      setFinish(pos);
      return;
    }

    if (isSame(pos, start) || isSame(pos, finish)) return;
    setWalls(prev => {
      const next = prev.some(w => isSame(w, pos))
        ? prev.filter(w => !isSame(w, pos))
        : [...prev, pos];
      wallsRef.current = next;
      return next;
    });
  };

  const loadGrid = (newStart: Position, newFinish: Position, newWalls: Position[]) => {
    setStart(newStart);
    setFinish(newFinish);
    setWalls(newWalls);
    wallsRef.current = newWalls;
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
