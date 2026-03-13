import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { ProgramItem } from '../../types';

type Props = {
  id: string;
  items: ProgramItem[];
  children: React.ReactNode;
  disabled?: boolean;
  isRoot?: boolean;
  blockId?: string; // owner block's item.id (loop/if)
  branchKey?: 'body' | 'then' | 'else'; // branch within the block
};

export const DroppableContainer: React.FC<Props> = ({
  id,
  items,
  children,
  disabled,
  isRoot,
  blockId,
  branchKey,
}) => {
  const containerId = blockId
    ? `container:${blockId}${branchKey ? `:${branchKey}` : ''}`
    : `container:${id}`;
  const { setNodeRef, isOver } = useDroppable({ id: containerId, disabled });

  return (
    <SortableContext
      id={containerId}
      items={items.map(item => item.id)}
      strategy={horizontalListSortingStrategy}
      disabled={disabled}
    >
      <div
        ref={setNodeRef}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          alignItems: 'flex-start',
          minWidth: isRoot ? '100%' : 32,
          minHeight: isRoot ? 48 : 28,
          width: isRoot ? '100%' : undefined,
          borderRadius: 3,
          transition: 'background 0.15s',
          background: isOver ? 'rgba(42, 157, 143, 0.15)' : 'transparent',
          position: 'relative',
          zIndex: isOver ? 1 : 'auto',
        }}
      >
        {children}
      </div>
    </SortableContext>
  );
};
