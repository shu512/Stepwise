import { arrayMove } from '@dnd-kit/sortable';
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
  const [activeMapId, setActiveMapId] = useState<string | null>(null);

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
    const id = Date.now().toString();
    update([{ id, name, gridSize, strictWalls, start, finish, walls, program }, ...maps]);
    setActiveMapId(id);
  };

  const deleteMap = (id: string) => {
    update(maps.filter(m => m.id !== id));
    if (activeMapId === id) setActiveMapId(null);
  };

  const loadMap = (map: SavedMap) => setActiveMapId(map.id);

  const importMap = (map: SavedMap) => update([map, ...maps]);

  const renameMap = (id: string, name: string) =>
    update(maps.map(m => (m.id === id ? { ...m, name } : m)));

  const reorderMaps = (fromId: string, toId: string) => {
    const from = maps.findIndex(m => m.id === fromId);
    const to = maps.findIndex(m => m.id === toId);
    if (from === -1 || to === -1) return;
    update(arrayMove(maps, from, to));
  };

  const importBulk = (incoming: SavedMap[]): number => {
    const existingIds = new Set(maps.map(m => m.id));
    const toAdd = incoming.filter(m => !existingIds.has(m.id));
    if (toAdd.length > 0) update([...toAdd, ...maps]);
    return toAdd.length;
  };

  const importLearningMaps = () => importBulk(LEARNING_MAPS);

  return {
    maps,
    activeMapId,
    loadMap,
    saveMap,
    deleteMap,
    importMap,
    renameMap,
    reorderMaps,
    importLearningMaps,
  };
};
