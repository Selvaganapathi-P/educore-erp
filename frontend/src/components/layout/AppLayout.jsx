import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header  from './Header';
import { useAuthStore } from '../../stores/authStore';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);

  // Super admin has their own console — redirect them out of the school portal
  if (user?.role === 'super_admin') return <Navigate to="/super-admin" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />

      {/* Content shifts right by sidebar width */}
      <div
        className="transition-all duration-200"
        style={{ marginLeft: collapsed ? '4rem' : '15rem' }}
      >
        <Header onMenuToggle={() => setCollapsed((p) => !p)} />

        <main className="pt-14 min-h-screen">
          <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </div>
  );
}
