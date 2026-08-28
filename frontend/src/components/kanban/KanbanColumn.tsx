import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function KanbanColumn({ id, title, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-80 flex-shrink-0 flex-col rounded-none bg-olive-100/50 p-4 transition-colors ${
        isOver ? 'bg-olive-200/80 ring-2 ring-olive-400' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-olive-900 capitalize">
          {title}
        </h3>
        {}
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}
