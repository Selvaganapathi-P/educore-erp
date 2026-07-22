import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import clsx from 'clsx';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { useAuthStore } from '../../stores/authStore';

export function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const logout = useAuthStore(s => s.logout);

  return (
    <div className="min-h-screen bg-slate-50">
      <SuperAdminSidebar collapsed={collapsed} />

      {/* Fixed header */}
      <header
        className={clsx(
          'fixed top-0 right-0 z-20 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 transition-all duration-200',
          collapsed ? 'left-16' : 'left-60',
        )}
      >
        <button onClick={() => setCollapsed(c => !c)} className="btn btn-icon btn-ghost">
          <Menu size={18} />
        </button>
        <span className="text-sm font-medium text-slate-400">Super Admin Console</span>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn btn-icon btn-ghost relative">
            <Bell size={18} />
          </button>
          <button onClick={logout} className="btn btn-outline btn-sm text-xs">Sign out</button>
        </div>
      </header>

      {/* Main */}
      <main
        className={clsx('pt-14 min-h-screen transition-all duration-200', collapsed ? 'ml-16' : 'ml-60')}
      >
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
