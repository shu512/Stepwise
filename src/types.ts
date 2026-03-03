export type Position = {
  row: number;
  col: number;
};

export type Command = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type CellKind = "empty" | "robot" | "start" | "finish" | "wall";