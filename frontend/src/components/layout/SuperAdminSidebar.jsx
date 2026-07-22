import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, CreditCard, LifeBuoy, Settings, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { label: 'Dashboard',  icon: LayoutDashboard, to: '/super-admin' },
  { label: 'Schools',    icon: Building2,        to: '/super-admin/schools' },
  { label: 'Users',      icon: Users,            to: '/super-admin/users' },
  { label: 'Billing',    icon: CreditCard,       to: '/super-admin/billing' },
  { label: 'Support',    icon: LifeBuoy,         to: '/super-admin/support' },
  { label: 'Settings',   icon: Settings,         to: '/super-admin/settings' },
];

export function SuperAdminSidebar({ collapsed }) {
  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Brand */}
      <div className={clsx('flex items-center h-14 px-4 border-b border-slate-700/60', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center font-bold text-sm shrink-0">E</div>
        {!collapsed && <span className="ml-2.5 font-semibold text-sm tracking-wide">EduCore Admin</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/super-admin'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
            {!collapsed && <ChevronRight size={14} className="ml-auto opacity-40" />}
          </NavLink>
        ))}
      </nav>

      <div className={clsx('p-3 border-t border-slate-700/60', collapsed && 'flex justify-center')}>
        <div className={clsx('flex items-center gap-2', collapsed && 'flex-col')}>
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold shrink-0">SA</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">Super Admin</p>
              <p className="text-xs text-slate-500 truncate">Platform</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
