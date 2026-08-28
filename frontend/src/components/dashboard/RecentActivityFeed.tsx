import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useEffect } from 'react';

export function RecentActivityFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['recentActivity'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.get(`/dashboard/recent-activity?skip=${pageParam}&take=10`);
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce((total, page) => total + page.activities.length, 0);
      if (loadedCount < lastPage.total) {
        return loadedCount;
      }
      return undefined;
    },
  });

  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') {
    return (
      <div className="space-y-4 p-6 pt-0">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (status === 'error') {
    return <div className="p-6 pt-0 text-sm text-red-500">Error loading recent activity.</div>;
  }

  const activities = data?.pages.flatMap(page => page.activities) || [];

  return (
    <div className="p-6 pt-0 space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.user?.name || 'System'} {activity.action} {activity.entityType}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))
      )}

      {}
      <div ref={targetRef} className="h-4 w-full flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex gap-1 items-center">
            <span className="text-sm text-muted-foreground">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}
