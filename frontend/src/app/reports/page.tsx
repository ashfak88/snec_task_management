'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ReportsPage() {
  const { user } = useAuthStore();

  const { data: projectProgress, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['reports-project-progress'],
    queryFn: async () => (await api.get('/reports/project-progress')).data,
    enabled: !!user && (user.role === 'Super Admin' || user.role === 'Admin'),
  });

  const { data: userProductivity, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['reports-user-productivity'],
    queryFn: async () => (await api.get('/reports/user-productivity')).data,
    enabled: !!user && (user.role === 'Super Admin' || user.role === 'Admin'),
  });

  const { data: overdueTasks, isLoading: isLoadingOverdue } = useQuery({
    queryKey: ['reports-overdue-tasks'],
    queryFn: async () => (await api.get('/reports/overdue-tasks')).data,
    enabled: !!user && (user.role === 'Super Admin' || user.role === 'Admin'),
  });

  if (user && user.role !== 'Super Admin' && user.role !== 'Admin') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have permission to view reports.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChartIcon className="w-6 h-6 text-olive-600" /> System Reports
          </h2>
          <p className="text-muted-foreground">Monitor project progress, user productivity, and overdue tasks.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Total tasks vs completed tasks per project</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProjects ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectProgress} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="totalTasks" name="Total Tasks" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completedTasks" name="Completed Tasks" fill="#426743" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>User Productivity</CardTitle>
              <CardDescription>Estimated hours vs actual hours per user</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userProductivity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="totalEstimatedHours" name="Estimated Hours" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalActualHours" name="Actual Hours" fill="#84cc16" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="border-red-100 shadow-sm">
          <CardHeader className="bg-red-50/50 rounded-t-lg border-b border-red-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-800">Overdue Tasks ({overdueTasks?.length || 0})</CardTitle>
            </div>
            <CardDescription className="text-red-600/80">Tasks that have passed their due date and are not completed.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Assignee</th>
                    <th className="px-4 py-3 font-medium">Due Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoadingOverdue ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Loading overdue tasks...
                      </td>
                    </tr>
                  ) : overdueTasks?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No overdue tasks! Great job!
                      </td>
                    </tr>
                  ) : (
                    overdueTasks?.map((task: any) => (
                      <tr key={task.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{task.title}</td>
                        <td className="px-4 py-3 text-gray-600">{task.project?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-600">{task.assignee?.name || 'Unassigned'}</td>
                        <td className="px-4 py-3 font-bold text-red-600">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border bg-gray-100 text-gray-800">
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
