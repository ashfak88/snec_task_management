import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Clock, User as UserIcon, X, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data?.users || [];
    },
    enabled: isOpen,
  });

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', task?.id],
    queryFn: async () => {
      const response = await api.get(`/comments/task/${task.id}`);
      return response.data;
    },
    enabled: !!task?.id && isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.post('/comments', { taskId: task.id, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
      toast.success('Comment added successfully');
      setNewComment('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string, content: string }) => {
      return api.patch(`/comments/${id}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task?.id] });
      toast.success('Comment updated successfully');
      setEditingCommentId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
      toast.success('Comment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  });

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createMutation.mutate(newComment);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewComment(value);

    const lastAtPos = value.lastIndexOf('@');
    if (lastAtPos !== -1) {
      const textAfterAt = value.substring(lastAtPos + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt.toLowerCase());
      } else {
        setMentionQuery(null);
      }
    } else {
      setMentionQuery(null);
    }
  };

  const handleMentionSelect = (userName: string) => {
    const lastAtPos = newComment.lastIndexOf('@');
    if (lastAtPos !== -1) {
      const textBeforeAt = newComment.substring(0, lastAtPos);
      setNewComment(`${textBeforeAt}@${userName} `);
      setMentionQuery(null);
    }
  };

  const handleEditSubmit = (id: string) => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ id, content: editContent });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {}
        <div className="px-6 py-4 border-b border-border flex justify-between items-start bg-olive-50">
          <div>
            <div className="flex gap-2 items-center mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-olive-200 text-olive-800 uppercase">
                {task.priority}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold">{task.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-500 hover:text-gray-900">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Description</h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {task.description || <span className="text-gray-400 italic">No description provided.</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
             <div>
               <p className="text-xs text-muted-foreground uppercase">Assignee</p>
               <p className="text-sm font-medium">{task.assignee?.name || 'Unassigned'}</p>
             </div>
             <div>
               <p className="text-xs text-muted-foreground uppercase">Reporter</p>
               <p className="text-sm font-medium">{task.reporter?.name || 'Unknown'}</p>
             </div>
             {task.dueDate && (
               <div>
                 <p className="text-xs text-muted-foreground uppercase">Due Date</p>
                 <p className="text-sm font-medium flex items-center gap-1">
                   <Clock className="w-3 h-3 text-olive-600" />
                   {new Date(task.dueDate).toLocaleDateString()}
                 </p>
               </div>
             )}
             {task.estimatedHours != null && (
               <div>
                 <p className="text-xs text-muted-foreground uppercase">Est. Hours</p>
                 <p className="text-sm font-medium">{task.estimatedHours}h</p>
               </div>
             )}
             {task.actualHours != null && (
               <div>
                 <p className="text-xs text-muted-foreground uppercase">Actual Hours</p>
                 <p className="text-sm font-medium">{task.actualHours}h</p>
               </div>
             )}
          </div>

          {}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-olive-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comments ({comments?.length || 0})
            </h3>

            <div className="space-y-4 mb-6">
              {isLoading ? (
                <div className="text-center text-sm text-gray-400 py-4">Loading comments...</div>
              ) : comments?.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-4 italic">No comments yet. Be the first to comment!</div>
              ) : (
                comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-olive-100 flex-shrink-0 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-olive-600" />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-semibold text-sm text-gray-900">{comment.author?.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(comment.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {user?.id === comment.authorId && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditContent(comment.content);
                            }} className="text-gray-400 hover:text-blue-500">
                              <Edit className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteMutation.mutate(comment.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="mt-2 flex gap-2">
                          <Input 
                            className="h-8 text-sm"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            autoFocus
                          />
                          <Button size="sm" className="h-8" onClick={() => handleEditSubmit(comment.id)} disabled={updateMutation.isPending}>Save</Button>
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}

                      {comment.mentions?.length > 0 && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {comment.mentions.map((m: any) => (
                            <span key={m.id} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                              @{m.user?.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {}
            <form onSubmit={handleSubmit} className="flex gap-2 relative">
              <div className="relative flex-1">
                <Input
                  placeholder="Write a comment... (use @name to mention)"
                  value={newComment}
                  onChange={handleCommentChange}
                  disabled={createMutation.isPending}
                />

                {}
                {mentionQuery !== null && usersData && (
                  <div className="absolute bottom-full left-0 w-64 mb-1 bg-card text-card-foreground border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
                    {usersData
                      .filter((u: any) => u.name.toLowerCase().includes(mentionQuery))
                      .map((user: any) => (
                        <div 
                          key={user.id} 
                          className="px-3 py-2 text-sm hover:bg-olive-50 cursor-pointer flex items-center gap-2"
                          onClick={() => handleMentionSelect(user.name)}
                        >
                          <div className="w-6 h-6 rounded-full bg-olive-100 flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-olive-600" />
                          </div>
                          <span>{user.name}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 flex-shrink-0 rounded-md bg-olive-600 hover:bg-olive-700 text-white"
                disabled={!newComment.trim() || createMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
