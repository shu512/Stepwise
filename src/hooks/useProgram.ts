import { useState, useRef } from 'react';
import type { CommandKind, ProgramItem, LoopBlock, IfBlock, Condition } from '../types';
import {
  removeAtPath,
  updateLoopTimes,
  removeById,
  insertAtPath,
  findContainerPath,
  getContainerByPath,
  replaceContainerByPath,
  adjustPathAfterRemoval,
} from '../utils/program';
import { genId } from '../utils/ids';
import { arrayMove } from '@dnd-kit/sortable';

type StackFrame =
  | { kind: 'loop' }
  | { kind: 'if_then'; condition: Condition }
  | { kind: 'if_else'; condition: Condition; then: ProgramItem[] };

type StackEntry = {
  frame: StackFrame;
  items: ProgramItem[];
};

export const useProgram = () => {
  const [editStack, setEditStack] = useState<StackEntry[]>([
    { frame: { kind: 'loop' }, items: [] },
  ]);
  const editStackRef = useRef<StackEntry[]>([{ frame: { kind: 'loop' }, items: [] }]);

  const updateStack = (newStack: StackEntry[]) => {
    setEditStack(newStack);
    editStackRef.current = newStack;
  };

  const currentItems = () => editStackRef.current[editStackRef.current.length - 1].items;

  const addCommand = (cmd: CommandKind) => {
    const stack = editStackRef.current;
    updateStack(
      stack.map((entry, i) =>
        i === stack.length - 1
          ? { ...entry, items: [...entry.items, { id: genId(), type: 'command' as const, cmd }] }
          : entry,
      ),
    );
  };

  const removeAt = (path: number[]) => {
    const newItems = removeAtPath(editStackRef.current[0].items, path);
    updateStack([{ ...editStackRef.current[0], items: newItems }]);
  };

  const removeFromCurrentContext = (path: number[]) => {
    const stack = editStackRef.current;
    const top = stack[stack.length - 1];
    const newItems = removeAtPath(top.items, path);
    updateStack([...stack.slice(0, -1), { ...top, items: newItems }]);
  };

  const clearProgram = () => {
    updateStack([{ frame: { kind: 'loop' }, items: [] }]);
  };

  const cancelBlock = () => {
    if (editStackRef.current.length <= 1) return;
    updateStack(editStackRef.current.slice(0, -1));
  };

  // ── Loop ─────────────────────────────────────────────────────────────────

  const loopStart = () => {
    updateStack([...editStackRef.current, { frame: { kind: 'loop' }, items: [] }]);
  };

  const loopEnd = () => {
    const stack = editStackRef.current;
    if (stack.length < 2 || stack[stack.length - 1].frame.kind !== 'loop') return;
    const rawInput = window.prompt('Сколько раз повторить?', '2');
    if (rawInput === null) return;
    const times = parseInt(rawInput, 10);
    if (isNaN(times) || times < 1) {
      alert('Введи число ≥ 1');
      return;
    }
    const body = currentItems();
    const loop: LoopBlock = { id: genId(), type: 'loop', times, body };
    const parent = stack[stack.length - 2];
    updateStack([...stack.slice(0, -2), { ...parent, items: [...parent.items, loop] }]);
  };

  // ── If ────────────────────────────────────────────────────────────────────

  const ifStart = (condition: Condition) => {
    updateStack([...editStackRef.current, { frame: { kind: 'if_then', condition }, items: [] }]);
  };

  const ifElse = () => {
    const stack = editStackRef.current;
    const top = stack[stack.length - 1];
    if (top.frame.kind !== 'if_then') return;
    const thenItems = top.items;
    updateStack([
      ...stack.slice(0, -1),
      { frame: { kind: 'if_else', condition: top.frame.condition, then: thenItems }, items: [] },
    ]);
  };

  const ifEnd = () => {
    const stack = editStackRef.current;
    const top = stack[stack.length - 1];
    if (top.frame.kind !== 'if_then' && top.frame.kind !== 'if_else') return;
    let ifBlock: IfBlock;
    if (top.frame.kind === 'if_then') {
      ifBlock = {
        id: genId(),
        type: 'if',
        condition: top.frame.condition,
        then: top.items,
        else: [],
      };
    } else {
      ifBlock = {
        id: genId(),
        type: 'if',
        condition: top.frame.condition,
        then: top.frame.then,
        else: top.items,
      };
    }
    const parent = stack[stack.length - 2];
    updateStack([...stack.slice(0, -2), { ...parent, items: [...parent.items, ifBlock] }]);
  };

  // ── Drag and Drop ─────────────────────────────────────────────────────────

  const moveItem = (activeId: string, overId: string, overContainerPath: number[]) => {
    const program = editStackRef.current[0].items;

    const activeContainerPath = findContainerPath(program, activeId);
    if (activeContainerPath === null) return;

    const activeContainer = getContainerByPath(program, activeContainerPath);
    const activeIndex = activeContainer.findIndex(item => item.id === activeId);
    if (activeIndex === -1) return;
    const activeItem = activeContainer[activeIndex];

    const withoutActive = removeById(program, activeId);

    if (overId === '') {
      // Дропнули на контейнер — вставить в конец
      // overContainerPath указывает на блок (loop/if), getContainerByPath войдёт внутрь
      const adjustedPath = adjustPathAfterRemoval(
        overContainerPath,
        activeContainerPath,
        activeIndex,
      );
      const overContainer = getContainerByPath(withoutActive, adjustedPath);
      const newProgram = insertAtPath(
        withoutActive,
        adjustedPath,
        overContainer.length,
        activeItem,
      );
      updateStack([{ ...editStackRef.current[0], items: newProgram }]);
      return;
    }

    const isSameContainer = activeContainerPath.join('-') === overContainerPath.join('-');

    if (isSameContainer) {
      const overIndex = activeContainer.findIndex(item => item.id === overId);
      if (overIndex === -1) return;
      const newContainer = arrayMove(activeContainer, activeIndex, overIndex);
      const newProgram = replaceContainerByPath(program, activeContainerPath, newContainer);
      updateStack([{ ...editStackRef.current[0], items: newProgram }]);
    } else {
      const adjustedContainerPath = adjustPathAfterRemoval(
        overContainerPath,
        activeContainerPath,
        activeIndex,
      );
      const overContainer = getContainerByPath(withoutActive, adjustedContainerPath);
      const overIndex = overContainer.findIndex(item => item.id === overId);
      const insertIndex = overIndex === -1 ? overContainer.length : overIndex;
      const newProgram = insertAtPath(
        withoutActive,
        adjustedContainerPath,
        insertIndex,
        activeItem,
      );
      updateStack([{ ...editStackRef.current[0], items: newProgram }]);
    }
  };

  const insertNewItem = (item: ProgramItem, overContainerPath: number[], overIndex: number) => {
    const program = editStackRef.current[0].items;
    const newProgram = insertAtPath(program, overContainerPath, overIndex, item);
    updateStack([{ ...editStackRef.current[0], items: newProgram }]);
  };

  const updateTimes = (path: number[], times: number) => {
    const newItems = updateLoopTimes(editStackRef.current[0].items, path, times);
    updateStack([{ ...editStackRef.current[0], items: newItems }]);
  };

  const loadProgram = (program: ProgramItem[]) => {
    updateStack([{ frame: { kind: 'loop' }, items: program }]);
  };

  const isInLoop = editStack.length > 1 && editStack[editStack.length - 1].frame.kind === 'loop';
  const isInIf =
    editStack.length > 1 &&
    (editStack[editStack.length - 1].frame.kind === 'if_then' ||
      editStack[editStack.length - 1].frame.kind === 'if_else');
  const canElse = editStack.length > 1 && editStack[editStack.length - 1].frame.kind === 'if_then';
  const isEditing = editStack.length > 1;

  return {
    program: editStack[0].items,
    editStack,
    addCommand,
    removeAt,
    removeFromCurrentContext,
    clearProgram,
    cancelBlock,
    loopStart,
    loopEnd,
    ifStart,
    ifElse,
    ifEnd,
    moveItem,
    insertNewItem,
    updateTimes,
    loadProgram,
    isInLoop,
    isInIf,
    canElse,
    isEditing,
  };
};
