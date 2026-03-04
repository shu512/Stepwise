import { useState, useRef } from "react";
import type { Command, ProgramItem, LoopBlock, IfBlock, Condition } from "../types";
import { removeAtPath } from "../utils/program";

type StackFrame =
  | { kind: "loop" }
  | { kind: "if_then"; condition: Condition }
  | { kind: "if_else"; condition: Condition; then: ProgramItem[] };

type StackEntry = {
  frame: StackFrame;
  items: ProgramItem[];
};

export const useProgram = () => {
  // editStack: [{ frame, items }, ...]
  // frame корневого контекста не используется, items — это программа
  const [editStack, setEditStack] = useState<StackEntry[]>([{ frame: { kind: "loop" }, items: [] }]);
  const editStackRef = useRef<StackEntry[]>([{ frame: { kind: "loop" }, items: [] }]);

  const updateStack = (newStack: StackEntry[]) => {
    setEditStack(newStack);
    editStackRef.current = newStack;
  };

  const currentItems = () => editStackRef.current[editStackRef.current.length - 1].items;

  const addCommand = (cmd: Command) => {
    const stack = editStackRef.current;
    updateStack(stack.map((entry, i) =>
      i === stack.length - 1
        ? { ...entry, items: [...entry.items, cmd] }
        : entry
    ));
  };

  const removeAt = (path: number[]) => {
    const newItems = removeAtPath(editStackRef.current[0].items, path);
    updateStack([{ ...editStackRef.current[0], items: newItems }]);
  };

  const clearProgram = () => updateStack([{ frame: { kind: "loop" }, items: [] }]);

  // ── Loop ──────────────────────────────────────────────────────────────────

  const loopStart = () => {
    updateStack([...editStackRef.current, { frame: { kind: "loop" }, items: [] }]);
  };

  const loopEnd = () => {
    const stack = editStackRef.current;
    if (stack.length < 2 || stack[stack.length - 1].frame.kind !== "loop") return;

    const rawInput = window.prompt("Сколько раз повторить?", "2");
    if (rawInput === null) return;
    const times = parseInt(rawInput, 10);
    if (isNaN(times) || times < 1) { alert("Введи число ≥ 1"); return; }

    const body = currentItems();
    const loop: LoopBlock = { type: "loop", times, body };
    const parent = stack[stack.length - 2];
    updateStack([...stack.slice(0, -2), { ...parent, items: [...parent.items, loop] }]);
  };

  // ── If ────────────────────────────────────────────────────────────────────

  const ifStart = (condition: Condition) => {
    updateStack([...editStackRef.current, { frame: { kind: "if_then", condition }, items: [] }]);
  };

  const ifElse = () => {
    const stack = editStackRef.current;
    const top = stack[stack.length - 1];
    if (top.frame.kind !== "if_then") return;

    const thenItems = top.items;
    updateStack([
      ...stack.slice(0, -1),
      { frame: { kind: "if_else", condition: top.frame.condition, then: thenItems }, items: [] },
    ]);
  };

  const ifEnd = () => {
    const stack = editStackRef.current;
    const top = stack[stack.length - 1];
    if (top.frame.kind !== "if_then" && top.frame.kind !== "if_else") return;

    let ifBlock: IfBlock;
    if (top.frame.kind === "if_then") {
      ifBlock = { type: "if", condition: top.frame.condition, then: top.items, else: [] };
    } else {
      ifBlock = { type: "if", condition: top.frame.condition, then: top.frame.then, else: top.items };
    }

    const parent = stack[stack.length - 2];
    updateStack([...stack.slice(0, -2), { ...parent, items: [...parent.items, ifBlock] }]);
  };

  const loadProgram = (program: ProgramItem[]) => {
    updateStack([{ frame: { kind: "loop" }, items: program }]);
  };

  const isInLoop = editStack.length > 1 && editStack[editStack.length - 1].frame.kind === "loop";
  const isInIf = editStack.length > 1 && (
    editStack[editStack.length - 1].frame.kind === "if_then" ||
    editStack[editStack.length - 1].frame.kind === "if_else"
  );
  const canElse = editStack.length > 1 && editStack[editStack.length - 1].frame.kind === "if_then";
  const isEditing = editStack.length > 1;

  return {
    program: editStack[0].items,
    editStack,
    addCommand, removeAt, clearProgram,
    loopStart, loopEnd,
    ifStart, ifElse, ifEnd,
    loadProgram,
    isInLoop, isInIf, canElse, isEditing,
  };
};