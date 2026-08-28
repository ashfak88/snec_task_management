'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Activity, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const limit = 15;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, debouncedSearch, actionFilter],
    queryFn: async () => {
      const skip = (page - 1) * limit;
      let url = `/audit-logs?skip=${skip}&take=${limit}`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      if (actionFilter && actionFilter !== 'ALL') url += `&action=${actionFilter}`;

      const response = await api.get(url);
      return response.data; 
    },

    enabled: !!user && (user.role === 'Super Admin' || user.role === 'Admin'),
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-olive-100 text-olive-800 border-olive-200';
    }
  };

  if (user && user.role !== 'Super Admin' && user.role !== 'Admin') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have permission to view audit logs.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-olive-600" /> Audit Logs
            </h2>
            <p className="text-muted-foreground">Monitor system activities and user operations.</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs..."
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select 
              value={actionFilter} 
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-36 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted-foreground min-w-[600px]">
                <thead className="bg-olive-50 text-xs uppercase font-bold text-olive-800 dark:bg-olive-900/40 dark:text-olive-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Timestamp</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                    <th className="px-6 py-4 font-medium">Entity Type</th>
                    <th className="px-6 py-4 font-medium hidden md:table-cell">Entity ID</th>
                    <th className="px-6 py-4 font-medium hidden lg:table-cell">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : data?.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No audit logs found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    data?.logs?.map((log: any) => (
                      <tr key={log.id} className="hover:bg-olive-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {log.user?.name || 'System / Anonymous'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 uppercase text-xs font-semibold text-muted-foreground">
                          {log.entityType}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-400 hidden md:table-cell">
                          {log.entityId}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground hidden lg:table-cell">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {}
            {data && data.total > limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{((page - 1) * limit) + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, data.total)}</span> of <span className="font-medium text-foreground">{data.total}</span> entries
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= data.total}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
