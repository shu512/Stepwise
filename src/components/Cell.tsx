import React from "react";

type CellType = "empty" | "robot" | "start" | "finish";

type Props = {
  type: CellType;
  onClick: () => void;
};

const getColor = (type: CellType) => {
  switch (type) {
    case "robot":
      return "#4caf50";
    case "start":
      return "#2196f3";
    case "finish":
      return "#f44336";
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
        cursor: "pointer",
      }}
    />
  );
};