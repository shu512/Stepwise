export type Position = { row: number; col: number };
export type Command = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type CellKind = "empty" | "robot" | "start" | "finish" | "wall";

export type LoopBlock = {
  type: "loop";
  times: number;
  body: ProgramItem[];
};

export type ProgramItem = Command | LoopBlock;