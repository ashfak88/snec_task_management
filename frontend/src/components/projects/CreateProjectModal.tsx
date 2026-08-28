import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: any;
}

export function CreateProjectModal({ isOpen, onClose, projectToEdit }: CreateProjectModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        reset({
          name: projectToEdit.name,
          description: projectToEdit.description || '',
          priority: projectToEdit.priority || 'MEDIUM',
          startDate: projectToEdit.startDate ? new Date(projectToEdit.startDate).toISOString().split('T')[0] : '',
          endDate: projectToEdit.endDate ? new Date(projectToEdit.endDate).toISOString().split('T')[0] : '',
        });
      } else {
        reset({ priority: 'MEDIUM', name: '', description: '', startDate: '', endDate: '' });
      }
    }
  }, [isOpen, projectToEdit, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      if (projectToEdit) {
        const response = await api.patch(`/projects/${projectToEdit.id}`, data);
        return response.data;
      } else {
        const response = await api.post('/projects', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(projectToEdit ? 'Project updated successfully' : 'Project created successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${projectToEdit ? 'update' : 'create'} project`);
    }
  });

  const onSubmit = (data: ProjectFormValues) => {
    const payload: any = { ...data };
    if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
    else delete payload.startDate;

    if (payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();
    else delete payload.endDate;

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{projectToEdit ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {mutation.isError && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              Failed to {projectToEdit ? 'update' : 'create'} project.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Website Redesign" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Brief description of the project" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select 
              id="priority" 
              {...register('priority')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" id="startDate" {...register('startDate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input type="date" id="endDate" {...register('endDate')} />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending} className="bg-olive-600 hover:bg-olive-700 text-white">
              {isSubmitting || mutation.isPending 
                ? (projectToEdit ? 'Saving...' : 'Creating...') 
                : (projectToEdit ? 'Save Changes' : 'Create Project')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
