import { useState } from 'react';
import { LEARNING_MAPS } from '../data/learningMaps';
import type { Position, ProgramItem, SavedMap } from '../types';

const STORAGE_KEY = 'robot-programmer-maps';

const readMaps = (): SavedMap[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeMaps = (maps: SavedMap[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
};

export const useMaps = () => {
  const [maps, setMaps] = useState<SavedMap[]>(readMaps);

  const update = (next: SavedMap[]) => {
    setMaps(next);
    writeMaps(next);
  };

  const saveMap = (
    name: string,
    gridSize: number,
    strictWalls: boolean,
    start: Position,
    finish: Position,
    walls: Position[],
    program?: ProgramItem[],
  ) => {
    update([
      { id: Date.now().toString(), name, gridSize, strictWalls, start, finish, walls, program },
      ...maps,
    ]);
  };

  const deleteMap = (id: string) => update(maps.filter(m => m.id !== id));

  const importMap = (map: SavedMap) => update([map, ...maps]);

  const renameMap = (id: string, name: string) =>
    update(maps.map(m => (m.id === id ? { ...m, name } : m)));

  const importBulk = (incoming: SavedMap[]): number => {
    const existingIds = new Set(maps.map(m => m.id));
    const toAdd = incoming.filter(m => !existingIds.has(m.id));
    if (toAdd.length > 0) update([...toAdd, ...maps]);
    return toAdd.length;
  };

  const importLearningMaps = () => importBulk(LEARNING_MAPS);

  return { maps, saveMap, deleteMap, importMap, renameMap, importLearningMaps };
};
