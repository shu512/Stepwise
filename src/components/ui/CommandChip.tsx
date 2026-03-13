import { CMD_COLOR } from '../../constants';
import type { CommandKind } from '../../types';

type Props = {
  cmd: CommandKind;
  onClick?: () => void;
  dimmed?: boolean;
};

export const CommandChip: React.FC<Props> = ({ cmd, onClick, dimmed }) => (
  <div
    onClick={e => {
      e.stopPropagation();
      onClick?.();
    }}
    title={onClick ? 'Удалить' : undefined}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2px 8px',
      borderRadius: 3,
      backgroundColor: CMD_COLOR[cmd] ?? '#ddd',
      color: '#1a1a1a',
      fontWeight: 700,
      fontSize: 12,
      fontFamily: 'monospace',
      cursor: onClick ? 'pointer' : 'default',
      userSelect: 'none',
      border: '1px solid rgba(0,0,0,0.15)',
      opacity: dimmed ? 0.5 : 1,
    }}
  >
    {cmd}
  </div>
);
