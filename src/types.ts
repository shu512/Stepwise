export type Position = { row: number; col: number };
export type CellKind = 'empty' | 'robot' | 'start' | 'finish' | 'wall';
export type DrawMode = 'wall' | 'start' | 'finish';

export type CommandKind = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'STOP';

export type Condition = 'on_finish' | 'wall_above' | 'wall_below' | 'wall_left' | 'wall_right';

export type Command = {
  id: string;
  type: 'command';
  cmd: CommandKind;
};

export type LoopBlock = {
  id: string;
  type: 'loop';
  times: number;
  body: ProgramItem[];
};

export type IfBlock = {
  id: string;
  type: 'if';
  condition: Condition;
  then: ProgramItem[];
  else: ProgramItem[];
};

export type ProgramItem = Command | LoopBlock | IfBlock;

export type SavedMap = {
  id: string;
  name: string;
  gridSize: number;
  strictWalls: boolean;
  start: Position;
  finish: Position;
  walls: Position[];
  program?: ProgramItem[];
};
