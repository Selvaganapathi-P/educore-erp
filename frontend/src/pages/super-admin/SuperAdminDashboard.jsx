import { useQuery } from '@tanstack/react-query';
import { Building2, Users, LifeBuoy, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../lib/axios';

function StatCard({ label, value, icon: Icon, color, trend }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="card">
      <div className="card-body flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 truncate">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{value ?? '—'}</p>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  active:    'badge-success',
  trial:     'badge-primary',
  inactive:  'badge-slate',
  suspended: 'badge-danger',
};

export default function SuperAdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['platform-dashboard'],
    queryFn:  () => api.get('/platform/dashboard').then(r => r.data.data),
  });

  const stats   = data?.stats   ?? {};
  const schools = data?.recentSchools ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Dashboard</h1>
          <p className="page-subtitle">Real-time overview of all schools on EduCore</p>
        </div>
        <Link to="/super-admin/schools/new" className="btn btn-primary btn-md">
          <Plus size={16} /> Add School
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Schools"  value={stats.totalSchools} icon={Building2} color="blue"   />
        <StatCard label="Active Schools" value={stats.activeSchools} icon={Building2} color="green"  />
        <StatCard label="Total Users"    value={stats.totalUsers}   icon={Users}     color="purple"  />
        <StatCard label="Open Tickets"   value={stats.openTickets}  icon={LifeBuoy}  color="orange" />
      </div>

      {/* Recent schools */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recently Added Schools</h2>
          <Link to="/super-admin/schools" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>School</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 w-24 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : schools.map(s => (
                    <tr key={s._id}>
                      <td>
                        <p className="font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </td>
                      <td>
                        <span className="badge badge-slate capitalize">{s.subscriptionPlan}</span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[s.status] ?? 'badge-slate'} capitalize`}>{s.status}</span>
                      </td>
                      <td className="text-slate-500 text-sm">{dayjs(s.createdAt).format('DD MMM YYYY')}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
