import { useEffect, useRef, useState } from 'react';
import type { StopReason } from '../hooks/useRobot';
import type { CellKind, Position } from '../types';
import { isSame } from '../utils/grid';
import { Cell } from './Cell';

type Props = {
  gridSize: number;
  robot: Position;
  start: Position;
  finish: Position;
  walls: Position[];
  isRunning: boolean;
  isManual: boolean;
  stopReason: StopReason;
  onCellClick: (row: number, col: number) => void;
};

export const Grid: React.FC<Props> = ({
  gridSize,
  robot,
  start,
  finish,
  walls,
  isRunning,
  isManual,
  stopReason,
  onCellClick,
}) => {
  const [shaking, setShaking] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stopReason) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (stopReason === 'wall') {
      setShaking(true);
      timeoutRef.current = window.setTimeout(() => setShaking(false), 500);
    } else if (stopReason === 'stop') {
      setFlashing(true);
      timeoutRef.current = window.setTimeout(() => setFlashing(false), 600);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stopReason]);

  const cells = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const pos = { row, col };

      let type: CellKind = 'empty';
      if (isSame(robot, pos) && isRunning) type = 'robot';
      else if (isSame(start, pos)) type = 'start';
      else if (isSame(finish, pos)) type = 'finish';
      else if (walls.some(w => isSame(w, pos))) type = 'wall';

      cells.push(
        <Cell
          key={`${row}-${col}`}
          type={type}
          isRunning={isRunning}
          isManual={isManual}
          isError={isSame(robot, pos) && isRunning && stopReason === 'wall'}
          onClick={() => onCellClick(row, col)}
        />,
      );
    }
  }

  return (
    <>
      <style>{`
        @keyframes shake {
          0%   { transform: translate(0, 0); }
          15%  { transform: translate(-6px, 0); }
          30%  { transform: translate(6px, 0); }
          45%  { transform: translate(-4px, 0); }
          60%  { transform: translate(4px, 0); }
          75%  { transform: translate(-2px, 0); }
          90%  { transform: translate(2px, 0); }
          100% { transform: translate(0, 0); }
        }
        @keyframes flash-yellow {
          0%   { border-color: #b0a090; }
          30%  { border-color: #e9c46a; box-shadow: 0 0 16px 4px rgba(233, 196, 106, 0.9); background: rgba(233, 196, 106, 0.15); }
          70%  { border-color: #e9c46a; box-shadow: 0 0 16px 4px rgba(233, 196, 106, 0.9); background: rgba(233, 196, 106, 0.15); }
          100% { border-color: #b0a090; box-shadow: none; background: none; }
        }
      `}</style>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 48px)`,
          border: '1px solid #b0a090',
          animation: shaking
            ? 'shake 0.5s ease-in-out'
            : flashing
              ? 'flash-yellow 0.6s ease-in-out'
              : 'none',
        }}
      >
        {cells}
      </div>
    </>
  );
};
