import React from "react";
import type { ProgramItem } from "../types";
import { LOOP_COLORS } from "../constants";
import { CommandChip } from "./CommandChip";

type Props = {
  items: ProgramItem[];
  depth?: number;
  onRemove?: (index: number) => void;
};

export const ProgramDisplay: React.FC<Props> = ({ items, depth = 0, onRemove }) => {
  const palette = LOOP_COLORS[depth % LOOP_COLORS.length];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
      {items.map((item, i) => {
        if (typeof item === "string") {
          return (
            <CommandChip key={i} cmd={item} onClick={onRemove ? () => onRemove(i) : undefined} />
          );
        }
        return (
          <div key={i} style={{
            display: "inline-flex", flexDirection: "column", gap: 4,
            padding: "4px 8px",
            backgroundColor: palette.bg,
            border: `1px solid ${palette.border}`,
            borderRadius: 4,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: palette.border, fontFamily: "monospace" }}>
                repeat ×{item.times}
              </span>
              {onRemove && (
                <span
                  onClick={() => onRemove(i)}
                  title="Удалить блок"
                  style={{ cursor: "pointer", color: "#c0392b", fontSize: 11, fontWeight: 700 }}
                >
                  ✕
                </span>
              )}
            </div>
            <ProgramDisplay items={item.body} depth={depth + 1} />
          </div>
        );
      })}
    </div>
  );
};