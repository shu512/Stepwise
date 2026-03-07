import { useState } from 'react';
import { LEARNING_MAPS } from '../data/learningMaps';
import type { Position, ProgramItem, SavedMap } from '../types';

const STORAGE_KEY = 'robot-programmer-maps';

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
    gridSize: number,
    strictWalls: boolean,
    start: Position,
    finish: Position,
    walls: Position[],
    program?: ProgramItem[],
  ) => {
    const newMap: SavedMap = {
      id: Date.now().toString(),
      name,
      gridSize,
      strictWalls,
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

  const importMap = (map: SavedMap) => {
    const updated = [map, ...maps];
    setMaps(updated);
    saveToStorage(updated);
  };

  const renameMap = (id: string, name: string) => {
    const updated = maps.map(m => (m.id === id ? { ...m, name } : m));
    setMaps(updated);
    saveToStorage(updated);
  };

  const importBulk = (newMaps: SavedMap[]) => {
    const existingIds = new Set(maps.map(m => m.id));
    const toAdd = newMaps.filter(m => !existingIds.has(m.id));
    if (toAdd.length === 0) return 0;
    const updated = [...toAdd, ...maps];
    setMaps(updated);
    saveToStorage(updated);
    return toAdd.length;
  };

  const importLearningMaps = () => importBulk(LEARNING_MAPS);

  return { maps, saveMap, deleteMap, importMap, renameMap, importLearningMaps };
};
