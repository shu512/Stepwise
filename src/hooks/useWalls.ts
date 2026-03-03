import { useState, useRef } from "react";
import type { Position } from "../types";
import { START, FINISH } from "../constants";
import { isSame } from "../utils/program";

export const useWalls = () => {
  const [walls, setWalls] = useState<Position[]>([]);
  const wallsRef = useRef<Position[]>([]);

  const toggleWall = (row: number, col: number) => {
    const pos = { row, col };
    if (isSame(pos, START) || isSame(pos, FINISH)) return;
    setWalls(prev => {
      const next = prev.some(w => isSame(w, pos))
        ? prev.filter(w => !isSame(w, pos))
        : [...prev, pos];
      wallsRef.current = next;
      return next;
    });
  };

  return { walls, wallsRef, toggleWall };
};