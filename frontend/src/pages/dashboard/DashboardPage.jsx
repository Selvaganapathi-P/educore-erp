import { Users, GraduationCap, DollarSign, ClipboardCheck, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../lib/axios';

const attendanceData = [
  { day: 'Mon', present: 420, absent: 18 },
  { day: 'Tue', present: 435, absent: 12 },
  { day: 'Wed', present: 418, absent: 20 },
  { day: 'Thu', present: 440, absent: 8  },
  { day: 'Fri', present: 430, absent: 15 },
];

const feeData = [
  { month: 'Aug', collected: 420000, pending: 80000  },
  { month: 'Sep', collected: 510000, pending: 65000  },
  { month: 'Oct', collected: 480000, pending: 95000  },
  { month: 'Nov', collected: 560000, pending: 40000  },
  { month: 'Dec', collected: 490000, pending: 70000  },
  { month: 'Jan', collected: 540000, pending: 55000  },
];

const STAT_META = [
  { label: 'Total Students',   key: 'students',   icon: GraduationCap, color: 'bg-primary-100 text-primary-600' },
  { label: 'Active Staff',     key: 'staff',      icon: Users,          color: 'bg-success-100 text-success-600' },
  { label: 'Fee Collected',    key: 'feeCollected', icon: DollarSign,   color: 'bg-warning-100 text-warning-600' },
  { label: 'Attendance Today', key: 'attendance', icon: ClipboardCheck, color: 'bg-info-100 text-info-600'      },
];

const RECENT_ADMISSIONS = [
  { name: 'Aanya Sharma',  class: 'Grade 5-A', date: 'Today',      status: 'active'  },
  { name: 'Rohan Mehta',   class: 'Grade 8-B', date: 'Yesterday',  status: 'pending' },
  { name: 'Priya Patel',   class: 'Grade 3-C', date: '2 days ago', status: 'active'  },
  { name: 'Arjun Singh',   class: 'Grade 10-A',date: '3 days ago', status: 'active'  },
];

const STATUS_MAP = {
  active:  'badge-success',
  pending: 'badge-warning',
  inactive:'badge-slate',
};

const fmtINR = (v) => `₹${(v / 100000).toFixed(1)}L`;

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const name = user?.profile?.firstName || 'Admin';
  const nav  = useNavigate();

  const { data: liveStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => Promise.allSettled([
      api.get('/students/stats').then(r => r.data.data),
      api.get('/staff/stats').then(r => r.data.data),
    ]).then(([students, staff]) => ({
      students: students.status === 'fulfilled' ? students.value?.total : null,
      staff:    staff.status === 'fulfilled'    ? staff.value?.total    : null,
    })),
    staleTime: 60_000,
  });

  const QUICK_ACTIONS = [
    { label: 'Mark Attendance',    color: 'bg-primary-50 text-primary-700 hover:bg-primary-100', to: '/attendance/mark'              },
    { label: 'Collect Fee',        color: 'bg-success-50 text-success-700 hover:bg-success-100', to: '/fees/collect'                  },
    { label: 'New Admission',      color: 'bg-warning-50 text-warning-700 hover:bg-warning-100', to: '/admissions/new'               },
    { label: 'Issue Library Book', color: 'bg-info-50    text-info-700    hover:bg-info-100',    to: '/library/issue'                 },
    { label: 'Send Announcement',  color: 'bg-slate-100  text-slate-700   hover:bg-slate-200',   to: '/communication/announcements/new' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, {name} 👋</h1>
          <p className="page-subtitle">Here's what's happening at your school today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/reports" className="btn btn-outline btn-sm">Download Report</Link>
          <Link to="/students/new" className="btn btn-primary btn-sm">+ Add Student</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_META.map((s) => {
          const live = liveStats?.[s.key];
          const display = live != null ? live.toLocaleString('en-IN') : '—';
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{display}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance bar chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="text-sm font-semibold text-slate-800">Weekly Attendance</p>
              <p className="text-xs text-slate-400 mt-0.5">Mon – Fri, this week</p>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData} barSize={20} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E2E8F0', boxShadow: 'none' }}
                  cursor={{ fill: '#F8FAFC' }}
                />
                <Bar dataKey="present" fill="#2563EB" radius={[3, 3, 0, 0]} name="Present" />
                <Bar dataKey="absent"  fill="#FEE2E2" radius={[3, 3, 0, 0]} name="Absent"  />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee area chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="text-sm font-semibold text-slate-800">Fee Collection</p>
              <p className="text-xs text-slate-400 mt-0.5">Aug – Jan</p>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={feeData}>
                <defs>
                  <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtINR} tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => fmtINR(v)}
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E2E8F0', boxShadow: 'none' }}
                />
                <Area type="monotone" dataKey="collected" stroke="#2563EB" strokeWidth={2} fill="url(#feeGrad)" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent admissions + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Admissions */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <p className="text-sm font-semibold text-slate-800">Recent Admissions</p>
            <Link to="/admissions" className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Admitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ADMISSIONS.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center">
                          {s.name[0]}
                        </div>
                        <span className="font-medium text-slate-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-500">{s.class}</td>
                    <td className="text-slate-500">{s.date}</td>
                    <td>
                      <span className={STATUS_MAP[s.status]}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <p className="text-sm font-semibold text-slate-800">Quick Actions</p>
          </div>
          <div className="card-body space-y-2">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => nav(a.to)}
                className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${a.color}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
