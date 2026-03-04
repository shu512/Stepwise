import type { ProgramItem, Command, Condition } from "../types";
import type { Position } from "../types";
import { isSame } from "./program";

export type RuntimeState = {
  pos: Position;
  start: Position;
  finish: Position;
  walls: Position[];
  gridSize: number;
};

const hasWall = (pos: Position, walls: Position[], dr: number, dc: number, gridSize: number): boolean => {
  const next = { row: pos.row + dr, col: pos.col + dc };
  if (next.row < 0 || next.col < 0 || next.row >= gridSize || next.col >= gridSize) return true;
  return walls.some(w => isSame(w, next));
};

export const checkCondition = (condition: Condition, state: RuntimeState): boolean => {
  switch (condition) {
    case "on_finish":   return isSame(state.pos, state.finish);
    case "wall_above":  return hasWall(state.pos, state.walls, -1,  0, state.gridSize);
    case "wall_below":  return hasWall(state.pos, state.walls,  1,  0, state.gridSize);
    case "wall_left":   return hasWall(state.pos, state.walls,  0, -1, state.gridSize);
    case "wall_right":  return hasWall(state.pos, state.walls,  0,  1, state.gridSize);
  }
};

type InterpreterResult = "stop" | "done";

export function* interpret(
  items: ProgramItem[],
  getState: () => RuntimeState,
): Generator<Command, InterpreterResult> {
  for (const item of items) {
    if (typeof item === "string") {
      if (item === "STOP") return "stop";
      yield item as Command;
    } else if (item.type === "loop") {
      for (let i = 0; i < item.times; i++) {
        const result = yield* interpret(item.body, getState);
        if (result === "stop") return "stop";
      }
    } else if (item.type === "if") {
      const branch = checkCondition(item.condition, getState()) ? item.then : item.else;
      const result = yield* interpret(branch, getState);
      if (result === "stop") return "stop";
    }
  }
  return "done";
}