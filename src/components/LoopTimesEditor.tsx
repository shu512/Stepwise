import { useState } from 'react';
import { COLOR_BG_LIGHT } from '../constants';

type Props = {
  times: number;
  color: string;
  onCommit: (times: number) => void;
};

export const LoopTimesEditor: React.FC<Props> = ({ times, color, onCommit }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  const start = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setValue(String(times));
  };

  const commit = () => {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 1) onCommit(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onClick={e => e.stopPropagation()}
        onBlur={commit}
        onKeyDown={e => {
          e.stopPropagation();
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        style={{
          width: 36,
          padding: '1px 4px',
          border: `1px solid ${color}`,
          borderRadius: 3,
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: 700,
          color,
          background: COLOR_BG_LIGHT,
          outline: 'none',
        }}
      />
    );
  }

  return (
    <span
      onDoubleClick={start}
      onClick={e => e.stopPropagation()}
      title="двойной клик — изменить"
      style={{
        fontSize: 11,
        fontWeight: 700,
        color,
        fontFamily: 'monospace',
        cursor: 'text',
        borderBottom: `1px dashed ${color}`,
      }}
    >
      {times}
    </span>
  );
};
