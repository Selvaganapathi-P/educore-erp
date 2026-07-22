import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export default function Header({ onMenuToggle }) {
  const navigate  = useNavigate();
  const { user, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 fixed top-0 right-0 left-60 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-20 transition-all duration-200">
      {/* Hamburger */}
      <button onClick={onMenuToggle} className="btn-icon lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="search"
          placeholder="Search students, fees, staff…"
          className="input pl-9 py-1.5 text-sm h-8"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen((p) => !p)} className="btn-icon relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger-500 rounded-full" />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-40 animate-scale-in">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Notifications</span>
                  <button className="text-xs text-primary-600">Mark all read</button>
                </div>
                <div className="p-3 text-center text-sm text-slate-400 py-8">No new notifications</div>
              </div>
            </>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
              {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {user?.profile?.firstName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-10 w-52 bg-white rounded-lg shadow-lg border border-slate-200 z-40 py-1 animate-scale-in">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>

                {[
                  { icon: User,     label: 'My profile', href: '/profile'  },
                  { icon: Settings, label: 'Settings',   href: '/settings' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.href); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <item.icon className="w-4 h-4 text-slate-400" />
                    {item.label}
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
