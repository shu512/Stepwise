// ── utils/program.ts ──────────────────────────────────────────────────────

import type { Position, CommandKind, ProgramItem } from '../types';

export const isSame = (a: Position, b: Position) => a.row === b.row && a.col === b.col;

export const move = (
  pos: Position,
  cmd: CommandKind,
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

  if (outOfBounds || hitWall) return strict ? null : pos;
  return { row, col };
};

export const countSteps = (items: ProgramItem[]): number => {
  let count = 0;
  for (const item of items) {
    if (item.type === 'command') count += 1;
    else if (item.type === 'loop') count += item.times * countSteps(item.body);
    else if (item.type === 'if') count += Math.max(countSteps(item.then), countSteps(item.else));
  }
  return count;
};

export const removeAtPath = (items: ProgramItem[], path: number[]): ProgramItem[] => {
  const [head, ...tail] = path;
  if (tail.length === 0) return items.filter((_, i) => i !== head);
  return items.map((item, i) => {
    if (i !== head) return item;
    if (item.type === 'command') return item;
    if (item.type === 'loop') return { ...item, body: removeAtPath(item.body, tail) };
    if (item.type === 'if') {
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
    if (item.type === 'command') return item;
    if (tail.length === 0 && item.type === 'loop') return { ...item, times };
    if (item.type === 'loop') return { ...item, body: updateLoopTimes(item.body, tail, times) };
    if (item.type === 'if') {
      if (tail[0] === 0) return { ...item, then: updateLoopTimes(item.then, tail.slice(1), times) };
      if (tail[0] === 1) return { ...item, else: updateLoopTimes(item.else, tail.slice(1), times) };
    }
    return item;
  });
};

export const findContainerPath = (
  items: ProgramItem[],
  id: string,
  currentPath: number[] = [],
): number[] | null => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id === id) return currentPath;
    if (item.type === 'loop') {
      const found = findContainerPath(item.body, id, [...currentPath, i]);
      if (found !== null) return found;
    }
    if (item.type === 'if') {
      const f1 = findContainerPath(item.then, id, [...currentPath, i, 0]);
      if (f1 !== null) return f1;
      const f2 = findContainerPath(item.else, id, [...currentPath, i, 1]);
      if (f2 !== null) return f2;
    }
  }
  return null;
};

// path указывает на блок (loop/if) — возвращает его тело/then/else
// path = [] → корневой массив
// path = [2] → body цикла на позиции 2
// path = [2, 0] → then ифа на позиции 2
// path = [2, 1] → else ифа на позиции 2
export const getContainerByPath = (items: ProgramItem[], path: number[]): ProgramItem[] => {
  if (path.length === 0) return items;
  const [head, ...tail] = path;
  const item = items[head];
  if (!item || item.type === 'command') return items;
  if (item.type === 'loop') {
    if (tail.length === 0) return item.body;
    return getContainerByPath(item.body, tail);
  }
  if (item.type === 'if') {
    if (tail.length === 0) return item.then;
    if (tail[0] === 0) return getContainerByPath(item.then, tail.slice(1));
    if (tail[0] === 1) return getContainerByPath(item.else, tail.slice(1));
  }
  return items;
};

export const removeById = (items: ProgramItem[], id: string): ProgramItem[] =>
  items
    .filter(item => item.id !== id)
    .map(item => {
      if (item.type === 'command') return item;
      if (item.type === 'loop') return { ...item, body: removeById(item.body, id) };
      if (item.type === 'if')
        return {
          ...item,
          then: removeById(item.then, id),
          else: removeById(item.else, id),
        };
      return item;
    });

// path указывает на контейнер (см. getContainerByPath)
// path = [] → вставить в корень
// path = [2] → вставить в body цикла на позиции 2
export const insertAtPath = (
  items: ProgramItem[],
  containerPath: number[],
  index: number,
  newItem: ProgramItem,
): ProgramItem[] => {
  if (containerPath.length === 0) {
    const result = [...items];
    result.splice(index, 0, newItem);
    return result;
  }
  const [head, ...tail] = containerPath;
  return items.map((item, i) => {
    if (i !== head) return item;
    if (item.type === 'command') return item;
    if (item.type === 'loop') {
      if (tail.length === 0) {
        const newBody = [...item.body];
        newBody.splice(index, 0, newItem);
        return { ...item, body: newBody };
      }
      return { ...item, body: insertAtPath(item.body, tail, index, newItem) };
    }
    if (item.type === 'if') {
      if (tail.length === 0) return item; // неоднозначно без then/else
      if (tail[0] === 0) {
        if (tail.length === 1) {
          const newThen = [...item.then];
          newThen.splice(index, 0, newItem);
          return { ...item, then: newThen };
        }
        return { ...item, then: insertAtPath(item.then, tail.slice(1), index, newItem) };
      }
      if (tail[0] === 1) {
        if (tail.length === 1) {
          const newElse = [...item.else];
          newElse.splice(index, 0, newItem);
          return { ...item, else: newElse };
        }
        return { ...item, else: insertAtPath(item.else, tail.slice(1), index, newItem) };
      }
    }
    return item;
  });
};

export const replaceContainerByPath = (
  items: ProgramItem[],
  path: number[],
  newContainer: ProgramItem[],
): ProgramItem[] => {
  if (path.length === 0) return newContainer;
  const [head, ...tail] = path;
  return items.map((item, i) => {
    if (i !== head) return item;
    if (item.type === 'command') return item;
    if (item.type === 'loop') {
      if (tail.length === 0) return { ...item, body: newContainer };
      return { ...item, body: replaceContainerByPath(item.body, tail, newContainer) };
    }
    if (item.type === 'if') {
      if (tail[0] === 0) {
        if (tail.length === 1) return { ...item, then: newContainer };
        return { ...item, then: replaceContainerByPath(item.then, tail.slice(1), newContainer) };
      }
      if (tail[0] === 1) {
        if (tail.length === 1) return { ...item, else: newContainer };
        return { ...item, else: replaceContainerByPath(item.else, tail.slice(1), newContainer) };
      }
    }
    return item;
  });
};

export const adjustPathAfterRemoval = (
  targetPath: number[],
  removedPath: number[],
  removedIndex: number,
): number[] => {
  if (targetPath.length === 0) return targetPath;
  if (
    removedPath.length === targetPath.length - 1 &&
    removedPath.every((v, i) => v === targetPath[i]) &&
    removedIndex < targetPath[targetPath.length - 1]
  ) {
    return [...targetPath.slice(0, -1), targetPath[targetPath.length - 1] - 1];
  }
  return targetPath;
};

export const findContainerPathById = (
  items: ProgramItem[],
  blockId: string,
  currentPath: number[] = [],
): number[] | null => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type === 'loop' && item.id === blockId) return [...currentPath, i];
    if (item.type === 'if' && item.id === blockId) return [...currentPath, i];
    if (item.type === 'loop') {
      const found = findContainerPathById(item.body, blockId, [...currentPath, i]);
      if (found) return found;
    }
    if (item.type === 'if') {
      const f1 = findContainerPathById(item.then, blockId, [...currentPath, i, 0]);
      if (f1) return f1;
      const f2 = findContainerPathById(item.else, blockId, [...currentPath, i, 1]);
      if (f2) return f2;
    }
  }
  return null;
};
