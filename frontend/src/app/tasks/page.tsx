'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import api from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { KanbanTask } from '@/components/kanban/KanbanTask';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { toast } from 'react-toastify';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [viewingTask, setViewingTask] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data?.users || [];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks');
      return response.data?.tasks || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ taskIds, status }: { taskIds: string[]; status: string }) => {
      return api.patch('/tasks/bulk-update-status', { taskIds, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task status updated successfully');
      setSelectedTaskIds([]);
      setBulkStatus('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task status');
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex gap-4 h-[calc(100vh-120px)]">
          {COLUMNS.map((col) => (
            <div key={col} className="w-80 flex-shrink-0">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          ))}
        </div>
      </AppLayout>
    );
  }

  const rawTasks = data || [];
  const tasks = view === 'list' ? rawTasks.filter((t: any) => {
    const matchesSearch = t.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
                          (t.description || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesAssignee = assigneeFilter ? t.assigneeId === assigneeFilter : true;
    return matchesSearch && matchesAssignee;
  }) : rawTasks;

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t: any) => t.id === activeId);
    if (!activeTask) return;

    if (COLUMNS.includes(overId)) {
      if (activeTask.status !== overId) {
        updateMutation.mutate({ taskIds: [activeId], status: overId });
      }
      return;
    }

    const overTask = tasks.find((t: any) => t.id === overId);
    if (overTask && activeTask.status !== overTask.status) {
      updateMutation.mutate({ taskIds: [activeId], status: overTask.status });
    }
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = () => {
    if (bulkStatus && selectedTaskIds.length > 0) {
      updateMutation.mutate({ taskIds: selectedTaskIds, status: bulkStatus });
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage your tasks visually or in bulk.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {view === 'list' && (
            <>
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="text-sm border border-gray-300 rounded-md py-1.5 px-3 w-48 focus:outline-none focus:ring-1 focus:ring-olive-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select 
                className="text-sm border border-input rounded-md py-1.5 px-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="">All Assignees</option>
                {usersData?.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </>
          )}

          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-olive-600 hover:bg-olive-700 text-white ml-2">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
          {selectedTaskIds.length > 0 && view === 'list' && (
            <div className="flex items-center gap-2 bg-olive-50 p-1.5 rounded-md border border-olive-200">
              <span className="text-sm font-medium text-olive-800 px-2">{selectedTaskIds.length} selected</span>
              <select 
                className="text-sm border-gray-300 rounded-md py-1 px-2"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                {COLUMNS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
              <Button 
                size="sm" 
                onClick={handleBulkUpdate} 
                disabled={!bulkStatus || updateMutation.isPending}
              >
                Apply
              </Button>
            </div>
          )}

          <div className="flex items-center rounded-md border border-input bg-background p-1">
            <Button 
              variant={view === 'kanban' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8"
              onClick={() => setView('kanban')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
            </Button>
            <Button 
              variant={view === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4 mr-2" /> List
            </Button>
          </div>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex h-[calc(100vh-180px)] gap-6 overflow-x-auto pb-4 no-scrollbar">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {COLUMNS.map((colStatus) => {
              const columnTasks = tasks.filter((t: any) => t.status === colStatus);
              return (
                <KanbanColumn key={colStatus} id={colStatus} title={colStatus.replace('_', ' ')}>
                  <SortableContext items={columnTasks.map((t: any) => t.id)}>
                    {columnTasks.map((task: any) => (
                      <KanbanTask key={task.id} task={task} onClick={() => setViewingTask(task)} />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              );
            })}

            <DragOverlay>
              {activeId ? (
                <div className="rotate-3 opacity-80 cursor-grabbing">
                  <KanbanTask task={tasks.find((t: any) => t.id === activeId)} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="bg-card text-card-foreground rounded-lg border border-border overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-olive-50 text-olive-800">
              <tr>
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedTaskIds.length === tasks.length && tasks.length > 0}
                    onChange={(e) => setSelectedTaskIds(e.target.checked ? tasks.map((t:any) => t.id) : [])}
                  />
                </th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Assignee</th>
                <th className="p-4 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task: any) => (
                <tr key={task.id} className="hover:bg-olive-50/50 cursor-pointer" onClick={() => setViewingTask(task)}>
                  <td className="p-4" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                    />
                  </td>
                  <td className="p-4 font-medium hover:text-olive-700 hover:underline">{task.title}</td>
                  <td className="p-4">
                    <span className="inline-flex rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-semibold">
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-semibold">
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4">{task.assignee?.name || 'Unassigned'}</td>
                  <td className="p-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <TaskDetailModal isOpen={!!viewingTask} onClose={() => setViewingTask(null)} task={viewingTask} />
      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </AppLayout>
  );
}
