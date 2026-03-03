import React from "react";
import type { CellKind } from "../types";

type Props = {
  type: CellKind;
  onClick: () => void;
};

const getColor = (type: CellKind) => {
  switch (type) {
    case "robot":
      return "#4caf50";
    case "start":
      return "#2196f3";
    case "finish":
      return "#f44336";
    case "wall":
      return "#333333";
    default:
      return "#ffffff";
  }
};

export const Cell: React.FC<Props> = ({ type, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: 50,
        height: 50,
        border: "1px solid #ccc",
        backgroundColor: getColor(type),
        boxSizing: "border-box",
        cursor: "pointer",
      }}
    />
  );
};