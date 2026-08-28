'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Briefcase, Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewingProject, setViewingProject] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const take = 6;

  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['projects', { search, status: statusFilter, priority: priorityFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      params.append('skip', ((page - 1) * take).toString());
      params.append('take', take.toString());

      const response = await api.get(`/projects?${params.toString()}`);
      return response.data; 
    },
  });

  const totalPages = data ? Math.ceil(data.total / take) : 1;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground">Manage your organization's projects here.</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-olive-600 hover:bg-olive-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        {}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-9 w-full bg-background"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <select
                className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <select
                className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="flex items-center rounded-md border border-input bg-background p-1 self-end sm:self-auto">
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> Grid
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

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6 shadow-sm flex flex-col justify-between h-48">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-md" />
                      <Skeleton className="h-5 w-32 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <div className="mb-4">
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {isFetching && (
              <div className="absolute inset-0 bg-background/50 z-10 rounded-lg"></div>
            )}

            {view === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data?.projects?.map((project: any) => (
                  <div onClick={() => setViewingProject(project)} key={project.id} className="cursor-pointer group relative flex flex-col justify-between rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md hover:border-olive-300">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary group-hover:text-olive-500" />
                          <h3 className="font-semibold leading-none tracking-tight text-foreground group-hover:text-olive-500 transition-colors">
                            {project.name}
                          </h3>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          project.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          project.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {project.priority}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                        {project.description || 'No description provided.'}
                      </p>

                      <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">Start:</span> 
                          {project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">End:</span> 
                          {project.endDate ? new Date(project.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                        <span className="font-bold text-foreground">{project._count?.tasks || 0}</span> Tasks
                      </div>
                      <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                        <span className="font-bold text-foreground">{project._count?.members || 0}</span> Members
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-muted text-foreground">
                    <tr>
                      <th className="p-4 font-medium">Project Name</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Priority</th>
                      <th className="p-4 font-medium">Dates</th>
                      <th className="p-4 font-medium">Team & Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.projects?.map((project: any) => (
                      <tr key={project.id} onClick={() => setViewingProject(project)} className="cursor-pointer hover:bg-olive-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" /> {project.name}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                            project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            project.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            project.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {project.priority}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground space-y-1">
                          <div>Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</div>
                          <div>End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</div>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground space-y-1">
                          <div>{project._count?.members || 0} Members</div>
                          <div>{project._count?.tasks || 0} Tasks</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(!data?.projects || data.projects.length === 0) && (
              <div className="col-span-full py-16 px-6 text-center bg-card text-card-foreground border shadow-sm rounded-lg flex flex-col items-center justify-center mt-4">
                <div className="w-16 h-16 bg-olive-50 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-olive-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No projects found</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search or filters to find what you're looking for, or create a new project.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Project
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {data && data.total > take && (
          <div className="flex items-center justify-between px-2 py-4">
            <span className="text-sm text-muted-foreground">
              Showing {((page - 1) * take) + 1} to {Math.min(page * take, data.total)} of {data.total} projects
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

        <CreateProjectModal 
          isOpen={isCreateModalOpen || !!viewingProject} 
          onClose={() => {
            setIsCreateModalOpen(false);
            setViewingProject(null);
          }} 
          projectToEdit={viewingProject}
        />

      </div>
    </AppLayout>
  );
}
