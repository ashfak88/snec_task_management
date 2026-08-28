import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '../ui/card';
import { Clock, MessageSquare } from 'lucide-react';

interface KanbanTaskProps {
  task: any;
  onClick?: () => void;
}

export function KanbanTask({ task, onClick }: KanbanTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!task) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card 
        className="cursor-grab hover:border-olive-400 active:cursor-grabbing shadow-sm transition-shadow hover:shadow-md"
        onClick={onClick}
      >
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              task.priority === 'HIGH' || task.priority === 'URGENT' 
                ? 'bg-red-100 text-red-700' 
                : task.priority === 'MEDIUM' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-blue-100 text-blue-700'
            }`}>
              {task.priority}
            </span>
          </div>

          <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-2">
            {task.title}
          </h4>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task._count?.comments || 0}</span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-1 text-olive-600">
                <Clock className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
