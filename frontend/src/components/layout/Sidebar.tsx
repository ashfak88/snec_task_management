'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Briefcase, Users, Settings, BarChart, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Users', href: '/users', icon: Users, roles: ['Super Admin', 'Admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart, roles: ['Super Admin', 'Admin'] },
  { name: 'Audit Logs', href: '/audit-logs', icon: Activity, roles: ['Super Admin', 'Admin'] },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredMenu = MENU_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <>
      {}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside 
        className={cn(
          "absolute left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-hidden bg-primary text-primary-foreground border-r border-olive-700 duration-300 ease-linear lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 mt-4">
        <Link href="/dashboard" className="text-2xl font-bold tracking-widest text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-primary rounded-lg flex items-center justify-center font-bold">
            P
          </div>
          ProjectHub
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear mt-8">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-md px-4 py-3 font-medium duration-300 ease-in-out hover:bg-olive-700 hover:text-white',
                        isActive && 'bg-olive-700 text-white font-bold shadow-sm'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
    </>
  );
}
