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
  isError: boolean;
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
  isError,
  onCellClick,
}) => {
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
          isError={isSame(robot, pos) && isRunning && isError}
          onClick={() => onCellClick(row, col)}
        />,
      );
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 48px)`,
        border: '1px solid #b0a090',
      }}
    >
      {cells}
    </div>
  );
};
