import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, DollarSign, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { exportCSV } from '../../lib/csvExport';

function MiniBar({ value, max, color = 'bg-primary-500' }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}/></div>;
}

const STATUS_CFG = {
  paid:     { color: 'badge-success', label: 'Paid'     },
  partial:  { color: 'badge-warning', label: 'Partial'  },
  unpaid:   { color: 'badge-default', label: 'Unpaid'   },
  overdue:  { color: 'badge-error',   label: 'Overdue'  },
};

export default function FeeReportPage() {
  const [academicYearId, setAcademicYearId] = useState('');
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');

  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data), staleTime: 300_000 });

  const params = {};
  if (academicYearId) params.academicYearId = academicYearId;
  if (from) params.from = from;
  if (to)   params.to   = to;

  const { data, isLoading } = useQuery({
    queryKey: ['reports-fees', params],
    queryFn:  () => api.get('/reports/fees', { params }).then(r => r.data.data),
    staleTime: 60_000,
  });

  const s         = data?.summary  ?? {};
  const byMonth   = data?.byMonth  ?? [];
  const byStatus  = data?.byStatus ?? [];
  const defaulters= data?.topDefaulters ?? [];

  const fmtC = (n) => n != null ? `₹${Math.round(n).toLocaleString('en-IN')}` : '₹0';
  const collPct = s.totalInvoiced ? Math.round((s.totalCollected / s.totalInvoiced) * 100) : 0;

  const maxMonthly = Math.max(...byMonth.map(m => m.invoiced), 1);

  const handleExportDefaulters = () => {
    const studentName = (rec) => {
      const p = rec.studentId?.userId?.profile;
      return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : rec.studentId?.rollNumber || '—';
    };
    exportCSV(
      defaulters.map(d => ({
        Name:      studentName(d),
        Roll:      d.studentId?.rollNumber || '',
        Class:     d.studentId?.class?.name || '',
        Invoiced:  d.totalAmount,
        Paid:      d.paidAmount,
        Balance:   d.totalAmount - d.paidAmount,
        Status:    d.status,
      })),
      'fee-defaulters.csv',
    );
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Report</h1>
          <p className="page-subtitle">Collection analysis, outstanding balances, and defaulters</p>
        </div>
        <button onClick={handleExportDefaulters} className="btn btn-ghost btn-md"><Download size={14}/> Export Defaulters</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={academicYearId} onChange={e => setAcademicYearId(e.target.value)} className="form-select w-44">
          <option value="">All Academic Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="form-input w-36 text-sm" placeholder="From"/>
          <span className="text-slate-400 text-xs">to</span>
          <input type="date" value={to}   onChange={e => setTo(e.target.value)}   className="form-input w-36 text-sm"/>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Invoiced',       value: fmtC(s.totalInvoiced),   color: 'text-slate-700'   },
          { label: 'Collected',      value: fmtC(s.totalCollected),  color: 'text-emerald-600' },
          { label: 'Outstanding',    value: fmtC(s.totalOutstanding),color: 'text-amber-600'   },
          { label: 'Collection %',   value: `${collPct}%`,           color: collPct >= 80 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'Paid Invoices',  value: s.paidCount    ?? 0,     color: 'text-emerald-600' },
          { label: 'Overdue',        value: s.overdueCount ?? 0,     color: 'text-red-600'     },
        ].map(k => (
          <div key={k.label} className="card card-body text-center py-3">
            {isLoading ? <div className="skeleton h-12 rounded"/> : <>
              <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </>}
          </div>
        ))}
      </div>

      {/* Collection bar */}
      {!isLoading && s.totalInvoiced > 0 && (
        <div className="card card-body space-y-3">
          <div className="flex justify-between text-sm font-semibold text-slate-700">
            <span>Collection Progress</span>
            <span>{collPct}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${collPct}%` }}/>
            <div className="bg-amber-400 h-full transition-all" style={{ width: `${s.totalOutstanding / s.totalInvoiced * 100}%` }}/>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>{fmtC(s.totalCollected)} collected</span>
            <span className="flex items-center gap-1">{fmtC(s.totalOutstanding)} outstanding<span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/></span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Monthly trend */}
        <div className="card card-body space-y-3 lg:col-span-2">
          <p className="font-semibold text-sm text-slate-700">Monthly Collection Trend</p>
          {isLoading
            ? Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-8 rounded"/>)
            : byMonth.length === 0
              ? <p className="text-sm text-slate-400 text-center py-8">No monthly data.</p>
              : (
                <div className="space-y-2">
                  {byMonth.map(m => (
                    <div key={m._id} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-16 shrink-0">{dayjs(m._id + '-01').format('MMM YY')}</span>
                      <div className="flex-1 relative h-6 bg-slate-100 rounded overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-emerald-400 rounded" style={{ width: `${Math.min((m.collected/maxMonthly)*100, 100)}%` }}/>
                        <div className="absolute inset-y-0 left-0 border-r-2 border-slate-600 opacity-30" style={{ left: `${Math.min((m.invoiced/maxMonthly)*100, 100)}%` }}/>
                      </div>
                      <div className="text-right shrink-0 w-24">
                        <p className="text-xs font-medium text-emerald-600">{fmtC(m.collected)}</p>
                        <p className="text-xs text-slate-400">{m.count} inv.</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
          }
        </div>

        {/* Status breakdown */}
        <div className="card card-body space-y-3">
          <p className="font-semibold text-sm text-slate-700">Invoice Status</p>
          {isLoading
            ? Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-10 rounded"/>)
            : byStatus.map(s => {
              const cfg = STATUS_CFG[s._id] ?? STATUS_CFG.unpaid;
              return (
                <div key={s._id} className="flex items-center gap-2">
                  <span className={`badge text-xs w-16 justify-center ${cfg.color}`}>{cfg.label}</span>
                  <MiniBar value={s.count} max={data?.summary?.invoiceCount || 1} color="bg-primary-400"/>
                  <span className="text-xs font-medium text-slate-600 w-6 text-right">{s.count}</span>
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Defaulters table */}
      <div className="card overflow-hidden">
        <div className="card-body border-b border-slate-100 flex items-center gap-2 py-3">
          <AlertTriangle size={14} className="text-amber-500"/>
          <p className="font-semibold text-sm text-slate-700">Top Defaulters</p>
          <span className="text-xs text-slate-400">({defaulters.length} records)</span>
        </div>
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-12 rounded"/>)}</div>
          : defaulters.length === 0
            ? <div className="p-8 text-center text-slate-400 text-sm">No outstanding invoices.</div>
            : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Invoiced</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Paid</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Balance</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulters.map(d => {
                    const p = d.studentId?.userId?.profile;
                    const name = p ? `${p.firstName??''} ${p.lastName??''}`.trim() : '—';
                    const cfg  = STATUS_CFG[d.status] ?? STATUS_CFG.unpaid;
                    return (
                      <tr key={d._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">{name}</p>
                          <p className="text-xs text-slate-400">{d.studentId?.rollNumber} · {d.studentId?.class?.name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">{fmtC(d.totalAmount)}</td>
                        <td className="px-4 py-3 text-sm text-right text-emerald-600 hidden sm:table-cell">{fmtC(d.paidAmount)}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-red-600">{fmtC(d.totalAmount - d.paidAmount)}</td>
                        <td className="px-4 py-3"><span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
        }
      </div>
    </div>
  );
}
