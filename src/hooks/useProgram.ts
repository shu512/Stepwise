import { useState, useRef } from "react";
import type { Command, ProgramItem, LoopBlock } from "../types";

export const useProgram = () => {
  const [editStack, setEditStack] = useState<ProgramItem[][]>([[]]);
  const editStackRef = useRef<ProgramItem[][]>([[]]);

  const updateStack = (newStack: ProgramItem[][]) => {
    setEditStack(newStack);
    editStackRef.current = newStack;
  };

  const addCommand = (cmd: Command) => {
    updateStack(editStackRef.current.map((ctx, i) =>
      i === editStackRef.current.length - 1 ? [...ctx, cmd] : ctx
    ));
  };

  const removeAt = (index: number) => {
    updateStack([[...editStackRef.current[0].filter((_, i) => i !== index)]]);
  };

  const undo = () => {
    updateStack(editStackRef.current.map((ctx, i) =>
      i === editStackRef.current.length - 1 ? ctx.slice(0, -1) : ctx
    ));
  };

  const clearProgram = () => updateStack([[]]);

  const loopStart = () => {
    updateStack([...editStackRef.current, []]);
  };

  const loopEnd = () => {
    const stack = editStackRef.current;
    if (stack.length < 2) return;

    const rawInput = window.prompt("Сколько раз повторить?", "2");
    if (rawInput === null) return;
    const times = parseInt(rawInput, 10);
    if (isNaN(times) || times < 1) { alert("Введи число ≥ 1"); return; }

    const body = stack[stack.length - 1];
    const loop: LoopBlock = { type: "loop", times, body };
    const parentCtx = [...stack[stack.length - 2], loop];
    updateStack([...stack.slice(0, -2), parentCtx]);
  };

  return {
    editStack,
    editStackRef,
    addCommand,
    removeAt,
    undo,
    clearProgram,
    loopStart,
    loopEnd,
    isInLoop: editStack.length > 1,
  };
};