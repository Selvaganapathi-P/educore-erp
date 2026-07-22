import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertTriangle, BookMarked, DollarSign, ArrowRight, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

function fmt(n) { return '₹' + Number(n ?? 0).toLocaleString('en-IN'); }

export default function LibraryDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['library-dashboard'],
    queryFn:  () => api.get('/library/dashboard').then(r => r.data.data),
    staleTime: 60_000,
  });

  const { data: overdue = [], isLoading: loadingOverdue } = useQuery({
    queryKey: ['library-overdue'],
    queryFn:  () => api.get('/library/issues/overdue').then(r => r.data.data),
    staleTime: 30_000,
  });

  const kpis = [
    { label: 'Total Titles',    value: data?.totalTitles    ?? 0, sub: `${data?.totalCopies ?? 0} copies`, icon: BookOpen,   color: 'bg-primary-50 text-primary-600' },
    { label: 'Available',       value: data?.availableCopies?? 0, sub: 'copies on shelf',                  icon: BookMarked, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Issued',          value: data?.issuedCount    ?? 0, sub: 'currently out',                    icon: Clock,      color: 'bg-amber-50 text-amber-600'     },
    { label: 'Overdue',         value: data?.overdueCount   ?? 0, sub: 'need follow-up',                   icon: AlertTriangle, color: 'bg-red-50 text-red-600'     },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Library</h1>
          <p className="page-subtitle">Book catalog, lending, and returns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/library/issue')} className="btn btn-primary btn-md">
            <BookOpen size={15}/> Issue Book
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="card card-body">
            {isLoading
              ? <div className="skeleton h-16 rounded-lg"/>
              : (
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
                    <k.icon size={18}/>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{k.value}</p>
                    <p className="text-xs text-slate-500">{k.label}</p>
                    <p className="text-xs text-slate-400">{k.sub}</p>
                  </div>
                </div>
              )
            }
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Book Catalog',   sub: 'Browse & manage books', href: '/library/books',  color: 'border-primary-200 hover:bg-primary-50' },
          { label: 'Issue / Return', sub: 'Manage lending',         href: '/library/issue',  color: 'border-emerald-200 hover:bg-emerald-50' },
          { label: 'Overdue List',   sub: `${overdue.length} books`, href: '/library/overdue',color: 'border-red-200 hover:bg-red-50'         },
        ].map(a => (
          <button key={a.href} onClick={() => navigate(a.href)}
            className={`card card-body flex items-center justify-between text-left border-2 transition-colors ${a.color}`}>
            <div>
              <p className="font-semibold text-slate-800">{a.label}</p>
              <p className="text-xs text-slate-500">{a.sub}</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 shrink-0"/>
          </button>
        ))}
      </div>

      {/* Fine collected */}
      {data?.fineCollected > 0 && (
        <div className="card card-body flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign size={18}/>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Fine Collected: {fmt(data.fineCollected)}</p>
            <p className="text-xs text-slate-500">Total from returned books</p>
          </div>
        </div>
      )}

      {/* Overdue list */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <p className="font-semibold text-slate-700">
            Overdue Books
            {overdue.length > 0 && <span className="ml-2 badge badge-error text-xs">{overdue.length}</span>}
          </p>
          <button onClick={() => navigate('/library/issue')} className="text-xs text-primary-600 hover:text-primary-700">
            Manage all <ArrowRight size={11} className="inline"/>
          </button>
        </div>
        {loadingOverdue
          ? <div className="p-4 space-y-2">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-10 rounded-lg"/>)}</div>
          : overdue.length === 0
            ? <div className="card-body text-center text-slate-400 py-8">No overdue books. Great job!</div>
            : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Book</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Member</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 hidden md:table-cell">Due Date</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500">Days Late</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 hidden sm:table-cell">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.slice(0, 10).map(issue => {
                    const name = issue.userId
                      ? `${issue.userId.profile?.firstName ?? ''} ${issue.userId.profile?.lastName ?? ''}`.trim()
                      : '—';
                    return (
                      <tr key={issue._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-sm text-slate-700 line-clamp-1">{issue.bookId?.title}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{name}</td>
                        <td className="px-4 py-2.5 text-xs text-red-500 hidden md:table-cell">{dayjs(issue.dueDate).format('DD MMM YYYY')}</td>
                        <td className="px-4 py-2.5 text-sm font-bold text-red-600 text-right">{issue.overdueDays}d</td>
                        <td className="px-4 py-2.5 text-sm text-red-600 text-right hidden sm:table-cell">{fmt(issue.accruedFine)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
        }
      </div>

      {/* Recent issues */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <p className="font-semibold text-slate-700">Recent Issues</p>
        </div>
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-10 rounded-lg"/>)}</div>
          : (data?.recentIssues ?? []).length === 0
            ? <div className="card-body text-center text-slate-400 py-6">No recent activity.</div>
            : (
              <div className="divide-y divide-slate-100">
                {(data?.recentIssues ?? []).map(issue => {
                  const name = issue.userId
                    ? `${issue.userId.profile?.firstName ?? ''} ${issue.userId.profile?.lastName ?? ''}`.trim()
                    : '—';
                  return (
                    <div key={issue._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                      <BookOpen size={14} className="text-slate-400 shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 line-clamp-1">{issue.bookId?.title}</p>
                        <p className="text-xs text-slate-400">{name} · Due {dayjs(issue.dueDate).format('DD MMM')}</p>
                      </div>
                      <span className={`badge text-xs ${issue.status === 'returned' ? 'badge-success' : 'badge-primary'}`}>{issue.status}</span>
                    </div>
                  );
                })}
              </div>
            )
        }
      </div>
    </div>
  );
}
