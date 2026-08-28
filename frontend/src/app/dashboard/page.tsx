'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  taskStatusDistribution: { name: string; value: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  'TODO': '#ef4444',        
  'IN PROGRESS': '#f59e0b', 
  'IN REVIEW': '#3b82f6',   
  'DONE': '#22c55e',        
};

const DEFAULT_COLOR = '#94a3b8';

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const response = await api.get('/dashboard/metrics');
      return response.data;
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Here is an overview of your projects and tasks.</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Active Projects"
              value={data?.activeProjects}
              total={data?.totalProjects}
              icon={Briefcase}
              color="text-blue-500"
            />
            <MetricCard
              title="Completed Tasks"
              value={data?.completedTasks}
              icon={CheckCircle}
              color="text-olive-500"
            />
            <MetricCard
              title="Pending Tasks"
              value={data?.pendingTasks}
              icon={Clock}
              color="text-yellow-500"
            />
            <MetricCard
              title="Overdue Tasks"
              value={data?.overdueTasks}
              icon={AlertTriangle}
              color="text-red-500"
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <RecentActivityFeed />
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                {!data?.taskStatusDistribution || data.taskStatusDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center bg-olive-50 dark:bg-olive-900/20 rounded-md border border-dashed border-olive-200">
                    <span className="text-olive-600 font-medium text-sm">No task data available</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.taskStatusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.taskStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || DEFAULT_COLOR} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function MetricCard({ title, value, total, icon: Icon, color }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value || 0}</div>
        {total !== undefined && (
          <p className="text-xs text-muted-foreground">
            out of {total} total
          </p>
        )}
      </CardContent>
    </Card>
  );
}
