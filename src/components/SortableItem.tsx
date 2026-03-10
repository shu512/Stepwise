import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
};

export const SortableItem: React.FC<Props> = ({ id, children, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        cursor: disabled ? 'default' : 'grab',
        display: 'inline-flex',
        position: 'relative',
        zIndex: isDragging ? 0 : 'auto', // dragging элемент уходит под остальные
      }}
    >
      {children}
    </div>
  );
};
