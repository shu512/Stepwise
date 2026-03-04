export type Position = { row: number; col: number };
export type Command = "UP" | "DOWN" | "LEFT" | "RIGHT" | "STOP";
export type CellKind = "empty" | "robot" | "start" | "finish" | "wall";
export type DrawMode = "wall" | "start" | "finish";

export type Condition =
  | "on_finish"
  | "wall_above"
  | "wall_below"
  | "wall_left"
  | "wall_right";

export type LoopBlock = {
  type: "loop";
  times: number;
  body: ProgramItem[];
};

export type IfBlock = {
  type: "if";
  condition: Condition;
  then: ProgramItem[];
  else: ProgramItem[];
};

export type ProgramItem = Command | LoopBlock | IfBlock;

export type SavedMap = {
  id: string;
  name: string;
  gridSize: number;
  start: Position;
  finish: Position;
  walls: Position[];
  program?: ProgramItem[];
};