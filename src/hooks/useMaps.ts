import { useState } from "react";
import type { SavedMap, Position, ProgramItem } from "../types";

const STORAGE_KEY = "robot-programmer-maps";

const loadFromStorage = (): SavedMap[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (maps: SavedMap[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
};

export const useMaps = () => {
  const [maps, setMaps] = useState<SavedMap[]>(loadFromStorage);

  const saveMap = (
    name: string,
    start: Position,
    finish: Position,
    walls: Position[],
    program?: ProgramItem[],
  ) => {
    const newMap: SavedMap = {
      id: Date.now().toString(),
      name,
      start,
      finish,
      walls,
      program,
    };
    const updated = [newMap, ...maps];
    setMaps(updated);
    saveToStorage(updated);
  };

  const deleteMap = (id: string) => {
    const updated = maps.filter(m => m.id !== id);
    setMaps(updated);
    saveToStorage(updated);
  };

  return { maps, saveMap, deleteMap };
};