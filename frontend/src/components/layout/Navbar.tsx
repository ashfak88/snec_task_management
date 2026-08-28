'use client';

import { useAuthStore } from '@/store/authStore';
import { User } from '@/store/authStore';
import { LogOut, User as UserIcon, Bell, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useRef, useEffect } from 'react';

const MySwal = withReactContent(Swal);

interface NavbarProps {
  user: User | null;
  setSidebarOpen: (arg: boolean) => void;
}

export function Navbar({ user, setSidebarOpen }: NavbarProps) {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 10000, 
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleLogout = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your session.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#426743',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const refreshToken = useAuthStore.getState().refreshToken;
          if (refreshToken) {
            await api.post('/auth/logout', { refreshToken });
          }
        } catch (error) {
          console.error('Failed to revoke refresh token on logout:', error);
        } finally {
          logout();
          router.push('/login');
          toast.success("Logged out successfully");
        }
      }
    });
  };

  return (
    <header className="sticky top-0 z-40 flex w-full bg-primary text-primary-foreground shadow-sm">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:bg-olive-700 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-white">ProjectHub</span>
        </div>

        <div className="hidden sm:block">
          {}
        </div>

        <div className="flex items-center gap-4 border-l border-olive-700 pl-4">
          <div className="text-white">
            <ThemeToggle />
          </div>
          <div className="relative" ref={notifRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-white hover:bg-olive-700 hover:text-white"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 border border-primary animate-pulse"></span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-popover text-popover-foreground rounded-md shadow-lg py-2 z-50 border border-border">
                <div className="px-4 py-2 border-b border-border font-bold">
                  Notifications ({unreadCount})
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 italic text-center">No notifications</div>
                  ) : (
                    notifications.map((notif: any) => (
                      <div 
                        key={notif.id} 
                        className={`px-4 py-3 border-b border-border cursor-pointer hover:bg-muted/50 ${!notif.isRead ? 'bg-olive-50/10 dark:bg-olive-900/40' : ''}`}
                        onClick={() => {
                          if (!notif.isRead) markReadMutation.mutate(notif.id);
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'text-muted-foreground'}`}>{notif.title}</p>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-olive-500 flex-shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <span className="block text-sm font-medium text-white">
                {user?.name}
              </span>
              <span className="block text-xs text-olive-200">
                {user?.role}
              </span>
            </div>

            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <UserIcon className="text-primary" />
            </div>

            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:text-red-300 hover:bg-olive-700">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
