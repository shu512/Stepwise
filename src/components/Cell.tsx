import React from "react";
import type { CellKind } from "../types";

type Props = {
  type: CellKind;
  onClick: () => void;
};

const getColor = (type: CellKind) => {
  switch (type) {
    case "robot":  return "#e63946";
    case "start":  return "#457b9d";
    case "finish": return "#2a9d8f";
    case "wall":   return "#6b5344";
    default:       return "transparent";
  }
};

export const Cell: React.FC<Props> = ({ type, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: 48, height: 48,
      backgroundColor: getColor(type),
      cursor: "pointer",
      boxSizing: "border-box",
      border: "1px solid #c8bfb0",
    }}
  />
);