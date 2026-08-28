import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const editUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
  passwordHash: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: any | null;
}

export function EditUserModal({ isOpen, onClose, userToEdit }: EditUserModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return response.data || [];
    },
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (userToEdit && isOpen) {
      setValue('name', userToEdit.name || '');
      setValue('email', userToEdit.email || '');
      setValue('mobile', userToEdit.mobile || '');
      setValue('roleId', userToEdit.role?.id || '');
      setValue('passwordHash', '');
    }
  }, [userToEdit, isOpen, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: EditUserFormValues) => {

      const payload = { ...data };
      if (!payload.passwordHash) delete payload.passwordHash;
      if (!payload.mobile) delete payload.mobile;

      return api.patch(`/users/${userToEdit.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      reset();
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update user');
    },
  });

  const onSubmit = (data: EditUserFormValues) => {
    setError(null);
    mutation.mutate(data);
  };

  if (!isOpen || !userToEdit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-olive-100">
          <h2 className="text-xl font-bold">Edit User: {userToEdit.name}</h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" placeholder="john@snec.in" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mobile">Mobile (Optional)</Label>
              <Input id="edit-mobile" placeholder="+91 9876543210" {...register('mobile')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-roleId">Role</Label>
              <select 
                id="edit-roleId" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('roleId')}
              >
                <option value="">Select a role</option>
                {rolesData?.map((role: any) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {errors.roleId && <p className="text-sm text-red-500">{errors.roleId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-passwordHash">New Password (Leave blank to keep current)</Label>
              <Input id="edit-passwordHash" type="password" {...register('passwordHash')} />
              {errors.passwordHash && <p className="text-sm text-red-500">{errors.passwordHash.message}</p>}
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-olive-100 flex justify-end gap-3 bg-gray-50/50">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="edit-user-form" disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
