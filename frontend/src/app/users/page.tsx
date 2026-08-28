'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, Plus, Search, MoreVertical, Edit, Trash2, Power } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { EditUserModal } from '@/components/users/EditUserModal';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { toast } from 'react-toastify';

export default function UsersPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [roleIdFilter, setRoleIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const take = 10;

  useEffect(() => {
    if (user && !['Super Admin', 'Admin'].includes(user.role)) {
      redirect('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    setPage(1);
  }, [roleIdFilter, statusFilter, debouncedSearch]);

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return response.data || [];
    },
    enabled: !!user,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', { search: debouncedSearch, roleId: roleIdFilter, status: statusFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (roleIdFilter) params.append('roleId', roleIdFilter);
      if (statusFilter) params.append('status', statusFilter);

      params.append('skip', ((page - 1) * take).toString());
      params.append('take', take.toString());

      const response = await api.get(`/users?${params.toString()}`);
      return response.data; 
    },
    enabled: !!user && ['Super Admin', 'Admin'].includes(user.role),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (userData: any) => {
      const newStatus = userData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return api.patch(`/users/${userData.id}`, { status: newStatus });
    },
    onSuccess: (data: any, variables: any) => {
      const toggledStatus = variables.status === 'ACTIVE' ? 'inactivated' : 'activated';
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User has been successfully ${toggledStatus}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  });

  const totalPages = data ? Math.ceil(data.total / take) : 1;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-olive-800">Users</h2>
            <p className="text-muted-foreground">Manage organization users and roles.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </div>

        {}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search by name or email..." 
              className="pl-9 w-full bg-background"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={roleIdFilter}
              onChange={(e) => setRoleIdFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {rolesData?.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto relative">
                {isFetching && (
                   <div className="absolute inset-0 bg-background/50 z-10"></div>
                )}
                <table className="w-full text-left text-sm text-muted-foreground min-w-[600px]">
                  <thead className="bg-olive-50 text-xs uppercase font-bold text-olive-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {data?.users?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No users found matching your filters.
                        </td>
                      </tr>
                    ) : data?.users?.map((u: any) => (
                      <tr key={u.id} className="hover:bg-olive-50/50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-olive-100 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-xs">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-olive-100 px-2.5 py-0.5 text-xs font-semibold text-olive-800">
                            {u.role?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditUser(u)} className="h-8 w-8 text-olive-600 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleStatusMutation.mutate(u)} 
                            className={`h-8 w-8 ${u.status === 'ACTIVE' ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50' : 'text-green-500 hover:text-green-600 hover:bg-green-50'}`}
                            title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setDeleteUser(u)} 
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            disabled={user?.id === u.id} 
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {}
          {data && data.total > take && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
              <span className="text-sm text-muted-foreground">
                Showing {((page - 1) * take) + 1} to {Math.min(page * take, data.total)} of {data.total} users
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        <CreateUserModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        <EditUserModal isOpen={!!editUser} onClose={() => setEditUser(null)} userToEdit={editUser} />
        <DeleteUserDialog isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} userToDelete={deleteUser} />
      </div>
    </AppLayout>
  );
}
