import { arrayMove } from '@dnd-kit/sortable';
import type { ProgramItem } from '../types';

// ── Tree traversal ────────────────────────────────────────────────────────

export const findById = (items: ProgramItem[], id: string): ProgramItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.type === 'loop') {
      const found = findById(item.body, id);
      if (found) return found;
    }
    if (item.type === 'if') {
      const found = findById(item.then, id) ?? findById(item.else, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Returns the path to the *container* that holds the item with the given id.
 * Path semantics: [] = root, [2] = body of loop at index 2,
 * [2, 0] = then-branch of if at index 2, [2, 1] = else-branch.
 */
export const findContainerPath = (
  items: ProgramItem[],
  id: string,
  current: number[] = [],
): number[] | null => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id === id) return current;
    if (item.type === 'loop') {
      const found = findContainerPath(item.body, id, [...current, i]);
      if (found !== null) return found;
    }
    if (item.type === 'if') {
      const f1 = findContainerPath(item.then, id, [...current, i, 0]);
      if (f1 !== null) return f1;
      const f2 = findContainerPath(item.else, id, [...current, i, 1]);
      if (f2 !== null) return f2;
    }
  }
  return null;
};

/** Returns the path to a block node (loop or if) by its id. */
export const findContainerPathById = (
  items: ProgramItem[],
  blockId: string,
  current: number[] = [],
): number[] | null => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if ((item.type === 'loop' || item.type === 'if') && item.id === blockId) {
      return [...current, i];
    }
    if (item.type === 'loop') {
      const found = findContainerPathById(item.body, blockId, [...current, i]);
      if (found) return found;
    }
    if (item.type === 'if') {
      const f1 = findContainerPathById(item.then, blockId, [...current, i, 0]);
      if (f1) return f1;
      const f2 = findContainerPathById(item.else, blockId, [...current, i, 1]);
      if (f2) return f2;
    }
  }
  return null;
};

/** Returns the nesting depth of a container:root id relative to the program tree. */
export const containerDepth = (id: string, program: ProgramItem[]): number => {
  if (id === 'container:root') return 0;
  if (id.startsWith('container:')) {
    const [blockId] = id.slice('container:'.length).split(':');
    const path = findContainerPathById(program, blockId);
    return path ? path.length + 1 : 1;
  }
  return -1;
};

// ── Container access ──────────────────────────────────────────────────────

export const getContainerByPath = (items: ProgramItem[], path: number[]): ProgramItem[] => {
  if (path.length === 0) return items;
  const [head, ...tail] = path;
  const item = items[head];
  if (!item || item.type === 'command') return items;
  if (item.type === 'loop')
    return tail.length === 0 ? item.body : getContainerByPath(item.body, tail);
  if (item.type === 'if') {
    if (tail.length === 0) return item.then;
    if (tail[0] === 0) return getContainerByPath(item.then, tail.slice(1));
    if (tail[0] === 1) return getContainerByPath(item.else, tail.slice(1));
  }
  return items;
};

export const replaceContainerByPath = (
  items: ProgramItem[],
  path: number[],
  next: ProgramItem[],
): ProgramItem[] => {
  if (path.length === 0) return next;
  const [head, ...tail] = path;
  return items.map((item, i) => {
    if (i !== head) return item;
    if (item.type === 'command') return item;
    if (item.type === 'loop') {
      if (tail.length === 0) return { ...item, body: next };
      return { ...item, body: replaceContainerByPath(item.body, tail, next) };
    }
    if (item.type === 'if') {
      if (tail[0] === 0) {
        if (tail.length === 1) return { ...item, then: next };
        return { ...item, then: replaceContainerByPath(item.then, tail.slice(1), next) };
      }
      if (tail[0] === 1) {
        if (tail.length === 1) return { ...item, else: next };
        return { ...item, else: replaceContainerByPath(item.else, tail.slice(1), next) };
      }
    }
    return item;
  });
};

// ── Mutation helpers ──────────────────────────────────────────────────────

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

export const removeById = (items: ProgramItem[], id: string): ProgramItem[] =>
  items
    .filter(item => item.id !== id)
    .map(item => {
      if (item.type === 'command') return item;
      if (item.type === 'loop') return { ...item, body: removeById(item.body, id) };
      if (item.type === 'if')
        return { ...item, then: removeById(item.then, id), else: removeById(item.else, id) };
      return item;
    });

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
        const body = [...item.body];
        body.splice(index, 0, newItem);
        return { ...item, body };
      }
      return { ...item, body: insertAtPath(item.body, tail, index, newItem) };
    }
    if (item.type === 'if') {
      if (tail.length === 0) return item;
      if (tail[0] === 0) {
        if (tail.length === 1) {
          const then = [...item.then];
          then.splice(index, 0, newItem);
          return { ...item, then };
        }
        return { ...item, then: insertAtPath(item.then, tail.slice(1), index, newItem) };
      }
      if (tail[0] === 1) {
        if (tail.length === 1) {
          const els = [...item.else];
          els.splice(index, 0, newItem);
          return { ...item, else: els };
        }
        return { ...item, else: insertAtPath(item.else, tail.slice(1), index, newItem) };
      }
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

// ── DnD helpers ───────────────────────────────────────────────────────────

/**
 * When an item is removed from its container, paths pointing into the same
 * container at a higher index need to be decremented by one.
 */
export const adjustPathAfterRemoval = (
  targetPath: number[],
  removedPath: number[],
  removedIndex: number,
): number[] => {
  if (targetPath.length === 0) return targetPath;
  const sameParent =
    removedPath.length === targetPath.length - 1 &&
    removedPath.every((v, i) => v === targetPath[i]);
  if (sameParent && removedIndex < targetPath[targetPath.length - 1]) {
    return [...targetPath.slice(0, -1), targetPath[targetPath.length - 1] - 1];
  }
  return targetPath;
};

export const moveItemInTree = (
  program: ProgramItem[],
  activeId: string,
  overId: string,
  overContainerPath: number[],
): ProgramItem[] => {
  const activeContainerPath = findContainerPath(program, activeId);
  if (activeContainerPath === null) return program;

  const activeContainer = getContainerByPath(program, activeContainerPath);
  const activeIndex = activeContainer.findIndex(item => item.id === activeId);
  if (activeIndex === -1) return program;

  const activeItem = activeContainer[activeIndex];
  const withoutActive = removeById(program, activeId);

  // Drop onto a container — append to end
  if (overId === '') {
    const adjustedPath = adjustPathAfterRemoval(
      overContainerPath,
      activeContainerPath,
      activeIndex,
    );
    const container = getContainerByPath(withoutActive, adjustedPath);
    return insertAtPath(withoutActive, adjustedPath, container.length, activeItem);
  }

  const isSameContainer = activeContainerPath.join('-') === overContainerPath.join('-');

  if (isSameContainer) {
    const overIndex = activeContainer.findIndex(item => item.id === overId);
    if (overIndex === -1) return program;
    const newContainer = arrayMove(activeContainer, activeIndex, overIndex);
    return replaceContainerByPath(program, activeContainerPath, newContainer);
  }

  const adjustedPath = adjustPathAfterRemoval(overContainerPath, activeContainerPath, activeIndex);
  const overContainer = getContainerByPath(withoutActive, adjustedPath);
  const overIndex = overContainer.findIndex(item => item.id === overId);
  const insertIndex = overIndex === -1 ? overContainer.length : overIndex;
  return insertAtPath(withoutActive, adjustedPath, insertIndex, activeItem);
};
