import { useDraggable } from '@dnd-kit/core';
import { COLOR_BG, COLOR_TEXT } from '../../constants';
import type { CommandKind } from '../../types';

const BASE_STYLE: React.CSSProperties = {
  padding: '5px 12px',
  border: '1px solid #b0a090',
  borderRadius: 3,
  background: COLOR_BG,
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: 13,
  fontWeight: 600,
  color: COLOR_TEXT,
  touchAction: 'none',
};

type Props = {
  cmd: CommandKind;
  disabled: boolean;
  onClick: () => void;
};

export const DraggableCmd: React.FC<Props> = ({ cmd, disabled, onClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `controls:${cmd}`,
    disabled,
    data: { source: 'controls', type: 'command', cmd },
  });

  const isStop = cmd === 'STOP';

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...BASE_STYLE,
        ...(isStop && { color: '#c0392b', borderColor: '#e0a0a0' }),
        opacity: isDragging ? 0.4 : disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {cmd}
    </button>
  );
};
