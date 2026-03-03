import React from "react";
import type { Command, DrawMode } from "../types";

type Props = {
  isRunning: boolean;
  isInLoop: boolean;
  drawMode: DrawMode;
  onDrawMode: (mode: DrawMode) => void;
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

const DRAW_MODES: { mode: DrawMode; label: string; color: string }[] = [
  { mode: "wall",   label: "стена",  color: "#6b5344" },
  { mode: "start",  label: "старт",  color: "#457b9d" },
  { mode: "finish", label: "финиш",  color: "#2a9d8f" },
];

const Spinner = () => (
  <span style={{
    display: "inline-block",
    width: 12, height: 12,
    border: "2px solid #b0a090",
    borderTopColor: "#6b5344",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  }} />
);

export const Controls: React.FC<Props> = ({
  isRunning, isInLoop, drawMode, onDrawMode,
  onCommand, onLoopStart, onLoopEnd,
  onUndo, onClear, onRun, onReset,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

    {/* Режим рисования */}
    <div style={{ display: "flex", gap: 6, alignItems: "center", opacity: isRunning ? 0.4 : 1 }}>
      <span style={{ fontSize: 11, color: "#a09080", fontFamily: "monospace" }}>рисовать:</span>
      {DRAW_MODES.map(({ mode, label, color }) => (
        <button
          key={mode}
          disabled={isRunning}
          onClick={() => onDrawMode(mode)}
          style={btn({
            color,
            borderColor: drawMode === mode ? color : "#b0a090",
            background: drawMode === mode ? "#fdfaf4" : "#f0ebe0",
            fontWeight: drawMode === mode ? 700 : 500,
            boxShadow: drawMode === mode ? `inset 0 -2px 0 ${color}` : "none",
          })}
        >
          {label}
        </button>
      ))}
    </div>

    {/* Команды */}
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      {(["UP", "DOWN", "LEFT", "RIGHT"] as Command[]).map(cmd => (
        <button key={cmd} disabled={isRunning} onClick={() => onCommand(cmd)}
          style={btn({ opacity: isRunning ? 0.4 : 1 })}>
          {cmd}
        </button>
      ))}

      <Divider />

      <button disabled={isRunning} onClick={onLoopStart}
        style={btn({ opacity: isRunning ? 0.4 : 1, background: isInLoop ? "#fde8a0" : undefined, borderColor: isInLoop ? "#c0a030" : undefined })}>
        LOOP START
      </button>
      <button disabled={isRunning || !isInLoop} onClick={onLoopEnd}
        style={btn({ opacity: isRunning || !isInLoop ? 0.4 : 1, background: isInLoop ? "#c8e6c9" : undefined, borderColor: isInLoop ? "#4caf50" : undefined })}>
        LOOP END
      </button>

      <Divider />

      <button disabled={isRunning} onClick={onUndo} style={btn({ opacity: isRunning ? 0.4 : 1 })}>UNDO</button>
      <button disabled={isRunning} onClick={onClear} style={btn({ opacity: isRunning ? 0.4 : 1, color: "#c0392b" })}>CLEAR</button>

      <Divider />

      <button disabled={isRunning} onClick={onRun}
        style={btn({ opacity: isRunning ? 0.4 : 1, background: "#c8e6c9", borderColor: "#4caf50" })}>
        {isRunning ? <Spinner /> : "RUN"}
      </button>
      <button onClick={onReset} style={btn()}>RESET</button>
    </div>
  </div>
);