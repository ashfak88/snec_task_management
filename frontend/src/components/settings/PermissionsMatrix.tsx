import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Save, RefreshCw } from 'lucide-react';

export function PermissionsMatrix() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['permissions-matrix'],
    queryFn: async () => {
      const response = await api.get('/permissions');
      return response.data; 
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string, permissionIds: string[] }) => {
      setSaving(roleId);
      const res = await api.put(`/permissions/roles/${roleId}`, { permissionIds });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Permissions updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['permissions-matrix'] });
    },
    onError: () => {
      toast.error('Failed to update permissions.');
    },
    onSettled: () => {
      setSaving(null);
    }
  });

  const handleToggle = (role: any, permission: any, isChecked: boolean) => {

    if (role.name === 'Super Admin') {
      toast.info('Super Admin automatically has all permissions.');
      return;
    }

    const currentPermissionIds = role.permissions.map((rp: any) => rp.permissionId);

    let newPermissionIds;
    if (isChecked) {
      newPermissionIds = [...currentPermissionIds, permission.id];
    } else {
      newPermissionIds = currentPermissionIds.filter((id: string) => id !== permission.id);
    }

    updateRoleMutation.mutate({ roleId: role.id, permissionIds: newPermissionIds });
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center text-muted-foreground"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  if (error || !data) {
    return <div className="text-red-500 py-4">Failed to load permissions data.</div>;
  }

  const { roles, permissions } = data;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-olive-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700 border-b border-r sticky left-0 bg-olive-50 min-w-[200px]">
                Permission
              </th>
              {roles.map((role: any) => (
                <th key={role.id} className="px-4 py-3 font-semibold text-center text-gray-700 border-b min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    {role.name}
                    {saving === role.id && <RefreshCw className="w-3 h-3 animate-spin text-olive-600" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-card text-card-foreground">
            {permissions.map((perm: any) => (
              <tr key={perm.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 border-r sticky left-0 bg-card text-card-foreground group-hover:bg-gray-50 uppercase text-xs">
                  <span className="inline-block w-16 text-muted-foreground text-[10px]">{perm.resource}</span>
                  {perm.action}
                </td>
                {roles.map((role: any) => {
                  const isSuperAdmin = role.name === 'Super Admin';
                  const hasPermission = isSuperAdmin || role.permissions.some((rp: any) => rp.permissionId === perm.id);
                  return (
                    <td key={`${role.id}-${perm.id}`} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        disabled={isSuperAdmin || saving === role.id}
                        onChange={(e) => handleToggle(role, perm, e.target.checked)}
                        className={`w-4 h-4 rounded border-gray-300 text-olive-600 focus:ring-olive-600 ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
