import React from "react";
import type { ProgramItem } from "../types";
import { LOOP_COLORS } from "../constants";
import { CommandChip } from "./CommandChip";

const IF_COLORS = [
  { bg: "#fff8e8", border: "#c0a030" },
  { bg: "#f0f8ff", border: "#4a90d9" },
];

type Props = {
  items: ProgramItem[];
  depth?: number;
  path?: number[];
  onRemove?: (path: number[]) => void;
};

export const ProgramDisplay: React.FC<Props> = ({ items, depth = 0, path = [], onRemove }) => {
  const loopPalette = LOOP_COLORS[depth % LOOP_COLORS.length];
  const ifPalette = IF_COLORS[depth % IF_COLORS.length];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
      {items.map((item, i) => {
        if (typeof item === "string") {
          return (
            <CommandChip
              key={i}
              cmd={item}
              onClick={onRemove ? () => onRemove([...path, i]) : undefined}
            />
          );
        }

        if (item.type === "loop") {
          return (
            <div
              key={i}
              onClick={onRemove ? () => onRemove([...path, i]) : undefined}
              title={onRemove ? "Удалить цикл" : undefined}
              style={{
                display: "inline-flex", flexDirection: "column", gap: 4,
                padding: "4px 8px",
                backgroundColor: loopPalette.bg,
                border: `1px solid ${loopPalette.border}`,
                borderRadius: 4,
                cursor: onRemove ? "pointer" : "default",
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: loopPalette.border,
                fontFamily: "monospace",
                pointerEvents: "none",
              }}>
                repeat ×{item.times}
              </span>
              <div onClick={e => e.stopPropagation()}>
                <ProgramDisplay
                  items={item.body}
                  depth={depth + 1}
                  path={[...path, i]}
                  onRemove={onRemove}
                />
              </div>
            </div>
          );
        }

        if (item.type === "if") {
          return (
            <div
              key={i}
              onClick={onRemove ? () => onRemove([...path, i]) : undefined}
              title={onRemove ? "Удалить if-блок" : undefined}
              style={{
                display: "inline-flex", flexDirection: "column", gap: 3,
                padding: "4px 8px",
                backgroundColor: ifPalette.bg,
                border: `1px solid ${ifPalette.border}`,
                borderRadius: 4,
                fontSize: 11, fontFamily: "monospace",
                cursor: onRemove ? "pointer" : "default",
              }}
            >
              <span style={{
                fontWeight: 700, color: ifPalette.border,
                pointerEvents: "none",
              }}>
                if {item.condition}
              </span>
              <div
                onClick={e => e.stopPropagation()}
                style={{ paddingLeft: 8, borderLeft: `2px solid ${ifPalette.border}` }}
              >
                <div style={{ fontSize: 10, color: "#6a6a6a", marginBottom: 2 }}>then</div>
                {item.then.length > 0
                  ? <ProgramDisplay
                      items={item.then}
                      depth={depth + 1}
                      path={[...path, i, 0]}
                      onRemove={onRemove}
                    />
                  : <span style={{ color: "#bbb", fontSize: 10 }}>пусто</span>
                }
              </div>
              {item.else.length > 0 && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ paddingLeft: 8, borderLeft: `2px solid #e08080` }}
                >
                  <div style={{ fontSize: 10, color: "#6a6a6a", marginBottom: 2 }}>else</div>
                  <ProgramDisplay
                    items={item.else}
                    depth={depth + 1}
                    path={[...path, i, 1]}
                    onRemove={onRemove}
                  />
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};