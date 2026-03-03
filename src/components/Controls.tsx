import React from "react";
import type { Command } from "../types";

type Props = {
  isRunning: boolean;
  isInLoop: boolean;
  onCommand: (cmd: Command) => void;
  onLoopStart: () => void;
  onLoopEnd: () => void;
  onUndo: () => void;
  onClear: () => void;
  onRun: () => void;
  onReset: () => void;
};

const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: "5px 12px",
  border: "1px solid #b0a090",
  borderRadius: 3,
  background: "#f5f0e8",
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 13,
  fontWeight: 600,
  color: "#2a2a2a",
  ...extra,
});

const Divider = () => (
  <span style={{ color: "#c0b0a0", fontSize: 16, userSelect: "none" }}>|</span>
);

export const Controls: React.FC<Props> = ({
  isRunning, isInLoop,
  onCommand, onLoopStart, onLoopEnd,
  onUndo, onClear, onRun, onReset,
}) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
    {(["UP", "DOWN", "LEFT", "RIGHT"] as Command[]).map(cmd => (
      <button key={cmd} disabled={isRunning} onClick={() => onCommand(cmd)} style={btn()}>
        {cmd}
      </button>
    ))}

    <Divider />

    <button disabled={isRunning} onClick={onLoopStart} style={btn(isInLoop ? { background: "#fde8a0", borderColor: "#c0a030" } : {})}>
      LOOP START
    </button>
    <button disabled={isRunning || !isInLoop} onClick={onLoopEnd} style={btn(isInLoop ? { background: "#c8e6c9", borderColor: "#4caf50" } : { opacity: 0.4 })}>
      LOOP END
    </button>

    <Divider />

    <button disabled={isRunning} onClick={onUndo} style={btn()}>UNDO</button>
    <button disabled={isRunning} onClick={onClear} style={btn({ color: "#c0392b" })}>CLEAR</button>

    <Divider />

    <button disabled={isRunning} onClick={onRun} style={btn({ background: "#c8e6c9", borderColor: "#4caf50" })}>RUN</button>
    <button onClick={onReset} style={btn()}>RESET</button>
  </div>
);