import {
  closestCenter,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type Collision,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import type { ProgramItem } from '../types';
import { genId } from '../utils/ids';
import {
  containerDepth,
  findById,
  findContainerPath,
  findContainerPathById,
  getContainerByPath,
} from '../utils/program';

type Options = {
  programRef: React.MutableRefObject<ProgramItem[]>;
  insertNewItem: (item: ProgramItem, containerPath: number[], index: number) => void;
  moveItem: (activeId: string, overId: string, overContainerPath: number[]) => void;
};

const makeCollisionDetection =
  (program: ProgramItem[]): CollisionDetection =>
  args => {
    const pointerCollisions: Collision[] = pointerWithin(args);

    const leafHit = pointerCollisions.find(c => {
      const id = String(c.id);
      return !id.startsWith('container:') && findById(program, id)?.type === 'command';
    });
    if (leafHit) return [leafHit];

    const deepContainerHit = pointerCollisions
      .filter(c => {
        const id = String(c.id);
        return id.startsWith('container:') && id !== 'container:root';
      })
      .sort(
        (a, b) => containerDepth(String(b.id), program) - containerDepth(String(a.id), program),
      )[0];
    if (deepContainerHit) return [deepContainerHit];

    const centerCollisions: Collision[] = closestCenter(args);
    if (centerCollisions.length > 0) {
      const filtered = centerCollisions.filter(c => {
        const id = String(c.id);
        return !id.startsWith('container:') || id === 'container:root';
      });
      return filtered.length > 0 ? [filtered[0]] : centerCollisions;
    }

    return pointerCollisions.length > 0 ? [pointerCollisions[0]] : [];
  };

const resolveContainerPath = (
  prog: ProgramItem[],
  blockId: string,
  branchKey: string,
): number[] | null => {
  const blockPath = findContainerPathById(prog, blockId);
  if (!blockPath) return null;
  if (!branchKey || branchKey === 'body') return blockPath;
  if (branchKey === 'then') return [...blockPath, 0];
  return [...blockPath, 1];
};

export const useDragHandlers = ({ programRef, insertNewItem, moveItem }: Options) => {
  const [activeItem, setActiveItem] = useState<ProgramItem | null>(null);
  const [isOverContainer, setIsOverContainer] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.source === 'controls') {
      setActiveItem({ id: '__preview__', type: 'command', cmd: data.cmd });
      return;
    }
    setActiveItem(findById(programRef.current, String(event.active.id)) ?? null);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const overId = String(e.over?.id ?? '');
    setIsOverContainer(overId.startsWith('container:') && overId !== 'container:root');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current;
    const overId = String(over.id);
    const prog = programRef.current;

    if (data?.source === 'controls') {
      const newItem: ProgramItem = { id: genId(), type: 'command', cmd: data.cmd };
      if (overId.startsWith('container:')) {
        const inner = overId.slice('container:'.length);
        if (inner === 'root') {
          insertNewItem(newItem, [], prog.length);
        } else {
          const [blockId, branchKey] = inner.split(':');
          const containerPath = resolveContainerPath(prog, blockId, branchKey);
          if (!containerPath) return;
          insertNewItem(newItem, containerPath, getContainerByPath(prog, containerPath).length);
        }
      } else {
        const containerPath = findContainerPath(prog, overId);
        if (!containerPath) return;
        const container = getContainerByPath(prog, containerPath);
        const index = container.findIndex(item => item.id === overId);
        insertNewItem(newItem, containerPath, index === -1 ? container.length : index);
      }
      return;
    }

    if (active.id === over.id) return;
    const activeId = String(active.id);

    if (overId.startsWith('container:')) {
      const inner = overId.slice('container:'.length);
      if (inner === 'root') {
        moveItem(activeId, '', []);
        return;
      }
      const [blockId, branchKey] = inner.split(':');
      const overPath = resolveContainerPath(prog, blockId, branchKey);
      if (!overPath) return;
      moveItem(activeId, '', overPath);
    } else {
      const containerPath = findContainerPath(prog, overId);
      if (containerPath === null) return;
      moveItem(activeId, overId, containerPath);
    }
  };

  const collisionDetection: CollisionDetection = args =>
    makeCollisionDetection(programRef.current)(args);

  return {
    sensors,
    activeItem,
    isOverContainer,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};
