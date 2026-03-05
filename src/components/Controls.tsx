import React, { useState } from "react";
import type { Command, Condition } from "../types";

type Props = {
  isRunning: boolean;
  isInLoop: boolean;
  isInIf: boolean;
  canElse: boolean;
  hasProgram: boolean;
  onCommand: (cmd: Command) => void;
  onLoopStart: () => void;
  onLoopEnd: () => void;
  onIfStart: (condition: Condition) => void;
  onIfElse: () => void;
  onIfEnd: () => void;
  onClear: () => void;
  onRun: () => void;
  onReset: () => void;
};

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "on_finish",  label: "на финише" },
  { value: "wall_above", label: "стена сверху" },
  { value: "wall_below", label: "стена снизу" },
  { value: "wall_left",  label: "стена слева" },
  { value: "wall_right", label: "стена справа" },
];

const Spinner = () => (
  <span style={{
    display: "inline-block", width: 12, height: 12,
    border: "2px solid #b0a090", borderTopColor: "#6b5344",
    borderRadius: "50%", animation: "spin 0.7s linear infinite",
  }} />
);

const Divider = () => (
  <span style={{ color: "#c0b0a0", fontSize: 16, userSelect: "none" }}>|</span>
);

export const Controls: React.FC<Props> = ({
  isRunning, isInLoop, isInIf, canElse, hasProgram,
  onCommand, onLoopStart, onLoopEnd,
  onIfStart, onIfElse, onIfEnd,
  onClear, onRun, onReset,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<Condition>("on_finish");

  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px", border: "1px solid #b0a090", borderRadius: 3,
    background: "#f5f0e8", cursor: "pointer", fontFamily: "monospace",
    fontSize: 13, fontWeight: 600, color: "#2a2a2a", ...extra,
  });

  const disabled = (extra?: React.CSSProperties): React.CSSProperties =>
    btn({ opacity: 0.4, cursor: "not-allowed", ...extra });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>

        {/* Команды движения */}
        {(["UP", "DOWN", "LEFT", "RIGHT"] as Command[]).map(cmd => (
          <button key={cmd} disabled={isRunning} onClick={() => onCommand(cmd)}
            style={isRunning ? disabled() : btn()}>
            {cmd}
          </button>
        ))}

        {/* STOP */}
        <button disabled={isRunning} onClick={() => onCommand("STOP")}
          style={isRunning ? disabled({ color: "#c0392b" }) : btn({ color: "#c0392b", borderColor: "#e0a0a0" })}>
          STOP
        </button>

        <Divider />

        {/* Loop */}
        <button disabled={isRunning} onClick={onLoopStart}
          style={isRunning ? disabled() : btn(isInLoop ? { background: "#fde8a0", borderColor: "#c0a030" } : {})}>
          LOOP START
        </button>
        <button disabled={isRunning || !isInLoop} onClick={onLoopEnd}
          style={isRunning || !isInLoop ? disabled() : btn({ background: "#c8e6c9", borderColor: "#4caf50" })}>
          LOOP END
        </button>

        <Divider />

        {/* If */}
        <select
          disabled={isRunning || isInIf}
          value={selectedCondition}
          onChange={e => setSelectedCondition(e.target.value as Condition)}
          style={{
            padding: "5px 8px", border: "1px solid #b0a090", borderRadius: 3,
            background: "#f5f0e8", fontFamily: "monospace", fontSize: 12,
            color: "#2a2a2a", opacity: isRunning || isInIf ? 0.4 : 1,
            cursor: isRunning || isInIf ? "not-allowed" : "pointer",
          }}
        >
          {CONDITIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button disabled={isRunning || isInIf} onClick={() => onIfStart(selectedCondition)}
          style={isRunning || isInIf ? disabled() : btn({ background: "#fff8e8", borderColor: "#c0a030" })}>
          IF
        </button>
        <button disabled={isRunning || !canElse} onClick={onIfElse}
          style={isRunning || !canElse ? disabled() : btn({ background: "#fde8e8", borderColor: "#e08080" })}>
          ELSE
        </button>
        <button disabled={isRunning || !isInIf} onClick={onIfEnd}
          style={isRunning || !isInIf ? disabled() : btn({ background: "#c8e6c9", borderColor: "#4caf50" })}>
          IF END
        </button>

        <Divider />

        {/* Clear / Run / Reset */}
        <button disabled={isRunning || !hasProgram} onClick={onClear}
          style={isRunning || !hasProgram ? disabled({ color: "#c0392b" }) : btn({ color: "#c0392b" })}>
          CLEAR
        </button>

        <Divider />

        <button disabled={isRunning} onClick={onRun}
          style={btn({ background: "#c8e6c9", borderColor: "#4caf50", opacity: isRunning ? 0.4 : 1 })}>
          {isRunning ? <Spinner /> : "RUN"}
        </button>
        <button disabled={!isRunning} onClick={onReset}
          style={!isRunning ? disabled() : btn()}>
          RESET
        </button>

      </div>
    </div>
  );
};