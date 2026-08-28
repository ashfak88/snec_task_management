import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userToDelete: any | null;
}

export function DeleteUserDialog({ isOpen, onClose, userToDelete }: DeleteUserDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to delete user');
    },
  });

  if (!isOpen || !userToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-olive-100">
          <h2 className="text-xl font-bold text-red-600">Delete User</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the user <strong>{userToDelete.name}</strong> ({userToDelete.email})? 
            This action cannot be undone.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-olive-100 flex justify-end gap-3 bg-gray-50/50">
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button 
            variant="destructive" 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => mutation.mutate(userToDelete.id)} 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
