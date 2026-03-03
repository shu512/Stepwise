import type { Position } from "./types";

export const GRID_SIZE = 8;
export const STEP_DELAY = 350;

export const START: Position = { row: 0, col: 0 };
export const FINISH: Position = { row: 7, col: 7 };

export const CMD_ARROW: Record<string, string> = {
  UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→",
};

export const CMD_COLOR: Record<string, string> = {
  UP:    "#f9c74f",
  DOWN:  "#90be6d",
  LEFT:  "#f8961e",
  RIGHT: "#43aa8b",
};

export const LOOP_COLORS = [
  { bg: "#e8e0d0", border: "#a0522d" },
  { bg: "#dde8d0", border: "#3a7d44" },
  { bg: "#d0dde8", border: "#2c5f8a" },
  { bg: "#e8d0e0", border: "#8a2c5f" },
];