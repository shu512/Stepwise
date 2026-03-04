import React from "react";
import type { Command } from "../types";
import { CMD_COLOR } from "../constants";

type Props = {
  cmd: Command;
  onClick?: () => void;
};

export const CommandChip: React.FC<Props> = ({ cmd, onClick }) => (
  <div
    onClick={e => {
      e.stopPropagation();
      onClick?.();
    }}
    title={onClick ? "Удалить" : undefined}
    style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "2px 8px",
      borderRadius: 3,
      backgroundColor: CMD_COLOR[cmd] ?? "#ddd",
      color: "#1a1a1a",
      fontWeight: 700,
      fontSize: 12,
      fontFamily: "monospace",
      cursor: onClick ? "pointer" : "default",
      userSelect: "none",
      border: "1px solid rgba(0,0,0,0.15)",
    }}
  >
    {cmd}
  </div>
);