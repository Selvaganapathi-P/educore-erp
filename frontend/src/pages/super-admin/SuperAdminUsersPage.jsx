import { useQuery } from '@tanstack/react-query';
import { Users, Search, Shield, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

export default function SuperAdminUsersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: () => api.get('/users?limit=50').then(r => r.data),
  });

  const users = (data?.data || []).filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${u.profile?.firstName} ${u.profile?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">All users across the platform</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-64">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="text-sm bg-transparent outline-none flex-1 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="card-body text-center text-slate-400 py-16">Loading…</div>
        ) : users.length === 0 ? (
          <div className="card-body text-center text-slate-400 py-16">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {(u.profile?.firstName?.[0] || u.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName || ''}`.trim() : '—'}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={10} />{u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <Shield size={10} />{u.role?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {dayjs(u.createdAt).format('MMM D, YYYY')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
