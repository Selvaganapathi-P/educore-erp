import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, DollarSign, BookOpen, BedDouble, Package,
  Heart, Calendar, BarChart2, ArrowRight, TrendingUp, TrendingDown,
} from 'lucide-react';
import api from '../../lib/axios';

function KpiCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="card card-body">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={18}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-slate-800 truncate">{value ?? '—'}</p>
          <p className="text-xs text-slate-500">{label}</p>
          {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
        </div>
        {trend != null && (
          <div className={`shrink-0 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniBar({ value, max, color = 'bg-primary-500' }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}/>
    </div>
  );
}

export default function ReportsDashboard() {
  const navigate = useNavigate();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports-summary'],
    queryFn:  () => api.get('/reports/summary').then(r => r.data.data),
    staleTime: 120_000,
  });

  const { data: studentData } = useQuery({
    queryKey: ['reports-students'],
    queryFn:  () => api.get('/reports/students').then(r => r.data.data),
    staleTime: 120_000,
  });

  const { data: feeData } = useQuery({
    queryKey: ['reports-fees-summary'],
    queryFn:  () => api.get('/reports/fees').then(r => r.data.data),
    staleTime: 120_000,
  });

  const fmt = (n) => n != null ? n.toLocaleString('en-IN') : '0';
  const fmtCurrency = (n) => n != null ? `₹${Math.round(n).toLocaleString('en-IN')}` : '₹0';
  const collectionPct = summary ? Math.round((summary.totalCollected / (summary.totalInvoiced || 1)) * 100) : 0;

  const kpis = [
    { label: 'Students',         value: fmt(summary?.totalStudents),  sub: 'enrolled',              icon: Users,      color: 'bg-primary-50 text-primary-600' },
    { label: 'Staff',            value: fmt(summary?.totalStaff),     sub: 'active members',        icon: UserCheck,  color: 'bg-teal-50 text-teal-600'       },
    { label: 'Fees Collected',   value: fmtCurrency(summary?.totalCollected), sub: `${collectionPct}% of invoiced`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Outstanding',      value: fmtCurrency(summary?.totalOutstanding), sub: `${summary?.unpaidInvoices ?? 0} invoices`, icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
    { label: 'Library Books',    value: fmt(summary?.totalBooks),     sub: `${fmt(summary?.availableBooks)} available`, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Hostel Occupancy', value: `${summary?.hostelOccupancyPct ?? 0}%`, sub: `${fmt(summary?.occupiedBeds)} / ${fmt(summary?.totalBeds)} beds`, icon: BedDouble, color: 'bg-purple-50 text-purple-600' },
    { label: 'Low Stock Items',  value: fmt(summary?.lowStockItems),  sub: 'need restocking',       icon: Package,    color: 'bg-red-50 text-red-600'         },
    { label: 'Upcoming Events',  value: fmt(summary?.upcomingEvents), sub: 'published',             icon: Calendar,   color: 'bg-pink-50 text-pink-600'       },
  ];

  const maxStudents = Math.max(...(studentData?.byClass?.map(c => c.count) ?? [1]), 1);

  const QUICK_LINKS = [
    { label: 'Attendance Report', sub: 'Class & date-range breakdown',     href: '/reports/attendance', icon: Users,      color: 'border-primary-200 hover:bg-primary-50' },
    { label: 'Fee Report',        sub: 'Collection, outstanding, defaulters', href: '/reports/fees',    icon: DollarSign, color: 'border-emerald-200 hover:bg-emerald-50' },
    { label: 'Academic Report',   sub: 'Exam results & rankings',          href: '/reports/academic',   icon: BarChart2,  color: 'border-amber-200 hover:bg-amber-50'     },
    { label: 'Student Report',    sub: 'Enrollment by class & gender',     href: '/reports/students',   icon: Users,      color: 'border-teal-200 hover:bg-teal-50'       },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">School-wide insights across all modules</p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="card card-body">
            {isLoading
              ? <div className="skeleton h-16 rounded-lg"/>
              : <KpiCard {...k}/>
            }
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Fee collection progress */}
        <div className="card card-body space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-slate-700">Fee Collection Status</p>
            <button onClick={() => navigate('/reports/fees')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Full report <ArrowRight size={11}/>
            </button>
          </div>
          {isLoading
            ? <div className="skeleton h-20 rounded"/>
            : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Collected</span>
                    <span className="font-semibold">{fmtCurrency(summary?.totalCollected)} ({collectionPct}%)</span>
                  </div>
                  <MiniBar value={summary?.totalCollected ?? 0} max={summary?.totalInvoiced ?? 1} color="bg-emerald-500"/>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Outstanding</span>
                    <span className="font-semibold text-amber-600">{fmtCurrency(summary?.totalOutstanding)}</span>
                  </div>
                  <MiniBar value={summary?.totalOutstanding ?? 0} max={summary?.totalInvoiced ?? 1} color="bg-amber-400"/>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {feeData?.byStatus?.map(s => (
                    <div key={s._id} className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-slate-700">{s.count}</p>
                      <p className="text-xs text-slate-500 capitalize">{s._id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>

        {/* Students by class */}
        <div className="card card-body space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-slate-700">Students by Class</p>
            <button onClick={() => navigate('/reports/students')} className="text-xs text-primary-600 hover:underline">View all</button>
          </div>
          {isLoading
            ? Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-6 rounded"/>)
            : !studentData?.byClass?.length
              ? <p className="text-xs text-slate-400">No data</p>
              : studentData.byClass.slice(0,8).map(cls => (
                <div key={cls._id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-20 truncate">{cls.className || 'Unknown'}</span>
                  <MiniBar value={cls.count} max={maxStudents} color="bg-primary-400"/>
                  <span className="text-xs font-medium text-slate-600 w-8 text-right">{cls.count}</span>
                </div>
              ))
          }
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_LINKS.map(a => (
          <button key={a.href} onClick={() => navigate(a.href)}
            className={`card card-body flex items-center justify-between text-left border-2 transition-colors ${a.color}`}>
            <div>
              <div className="flex items-center gap-1.5 mb-1"><a.icon size={14} className="text-slate-600"/><p className="font-semibold text-slate-800 text-sm">{a.label}</p></div>
              <p className="text-xs text-slate-500">{a.sub}</p>
            </div>
            <ArrowRight size={14} className="text-slate-400 shrink-0"/>
          </button>
        ))}
      </div>
    </div>
  );
}
