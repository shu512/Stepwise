import { useRef, useState } from 'react';
import type { CommandKind, Condition, IfBlock, LoopBlock, ProgramItem } from '../types';
import { genId } from '../utils/ids';
import { insertAtPath, moveItemInTree, removeAtPath, updateLoopTimes } from '../utils/program';

// ── Types ─────────────────────────────────────────────────────────────────

type LoopFrame = { kind: 'loop' };
type IfThenFrame = { kind: 'if_then'; condition: Condition };
type IfElseFrame = { kind: 'if_else'; condition: Condition; then: ProgramItem[] };
type StackFrame = LoopFrame | IfThenFrame | IfElseFrame;

export type StackEntry = {
  frame: StackFrame;
  items: ProgramItem[];
};

// ── Hook ──────────────────────────────────────────────────────────────────

export const useProgram = () => {
  const emptyStack = (): StackEntry[] => [{ frame: { kind: 'loop' }, items: [] }];

  const [editStack, setEditStack] = useState<StackEntry[]>(emptyStack);
  const stackRef = useRef<StackEntry[]>(emptyStack());

  const commit = (next: StackEntry[]) => {
    setEditStack(next);
    stackRef.current = next;
  };

  const top = () => stackRef.current[stackRef.current.length - 1];
  const program = () => stackRef.current[0].items;

  const patchTop = (items: ProgramItem[]) => {
    const stack = stackRef.current;
    commit([...stack.slice(0, -1), { ...top(), items }]);
  };

  const patchRoot = (items: ProgramItem[]) => {
    commit([{ ...stackRef.current[0], items }]);
  };

  // ── Commands ──────────────────────────────────────────────────────────

  const addCommand = (cmd: CommandKind) => {
    patchTop([...top().items, { id: genId(), type: 'command', cmd }]);
  };

  const removeAt = (path: number[]) => {
    patchRoot(removeAtPath(program(), path));
  };

  const removeFromCurrentContext = (path: number[]) => {
    patchTop(removeAtPath(top().items, path));
  };

  const clearProgram = () => commit(emptyStack());

  const cancelBlock = () => {
    if (stackRef.current.length <= 1) return;
    commit(stackRef.current.slice(0, -1));
  };

  const updateTimes = (path: number[], times: number) => {
    patchRoot(updateLoopTimes(program(), path, times));
  };

  const loadProgram = (items: ProgramItem[]) => {
    commit([{ frame: { kind: 'loop' }, items }]);
  };

  // ── Loop ──────────────────────────────────────────────────────────────

  const loopStart = () => {
    commit([...stackRef.current, { frame: { kind: 'loop' }, items: [] }]);
  };

  const loopEnd = (times: number) => {
    const stack = stackRef.current;
    if (stack.length < 2 || top().frame.kind !== 'loop') return;
    const loop: LoopBlock = { id: genId(), type: 'loop', times, body: top().items };
    const parent = stack[stack.length - 2];
    commit([...stack.slice(0, -2), { ...parent, items: [...parent.items, loop] }]);
  };

  // ── If ────────────────────────────────────────────────────────────────

  const ifStart = (condition: Condition) => {
    commit([...stackRef.current, { frame: { kind: 'if_then', condition }, items: [] }]);
  };

  const ifElse = () => {
    const stack = stackRef.current;
    const t = top();
    if (t.frame.kind !== 'if_then') return;
    commit([
      ...stack.slice(0, -1),
      { frame: { kind: 'if_else', condition: t.frame.condition, then: t.items }, items: [] },
    ]);
  };

  const ifEnd = () => {
    const stack = stackRef.current;
    const t = top();
    if (t.frame.kind !== 'if_then' && t.frame.kind !== 'if_else') return;

    const ifBlock: IfBlock =
      t.frame.kind === 'if_then'
        ? { id: genId(), type: 'if', condition: t.frame.condition, then: t.items, else: [] }
        : {
            id: genId(),
            type: 'if',
            condition: t.frame.condition,
            then: t.frame.then,
            else: t.items,
          };

    const parent = stack[stack.length - 2];
    commit([...stack.slice(0, -2), { ...parent, items: [...parent.items, ifBlock] }]);
  };

  // ── DnD ───────────────────────────────────────────────────────────────

  const moveItem = (activeId: string, overId: string, overContainerPath: number[]) => {
    patchRoot(moveItemInTree(program(), activeId, overId, overContainerPath));
  };

  const insertNewItem = (item: ProgramItem, containerPath: number[], index: number) => {
    patchRoot(insertAtPath(program(), containerPath, index, item));
  };

  // ── Derived state ─────────────────────────────────────────────────────

  const lastFrame = editStack[editStack.length - 1]?.frame;

  const isInLoop = editStack.length > 1 && lastFrame.kind === 'loop';
  const isInIf =
    editStack.length > 1 && (lastFrame.kind === 'if_then' || lastFrame.kind === 'if_else');
  const canElse = editStack.length > 1 && lastFrame.kind === 'if_then';
  const isEditing = editStack.length > 1;

  return {
    program: editStack[0].items,
    editStack,
    addCommand,
    removeAt,
    removeFromCurrentContext,
    clearProgram,
    cancelBlock,
    updateTimes,
    loadProgram,
    loopStart,
    loopEnd,
    ifStart,
    ifElse,
    ifEnd,
    moveItem,
    insertNewItem,
    isInLoop,
    isInIf,
    canElse,
    isEditing,
  };
};
