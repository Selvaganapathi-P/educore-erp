import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Users, X } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { exportCSV } from '../../lib/csvExport';

function MiniBar({ value, max, color = 'bg-primary-500' }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}/></div>;
}

export default function AttendanceReportPage() {
  const [classId,        setClassId]        = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [from,           setFrom]           = useState(dayjs().subtract(30,'day').format('YYYY-MM-DD'));
  const [to,             setTo]             = useState(dayjs().format('YYYY-MM-DD'));

  const { data: years   = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data), staleTime: 300_000 });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', academicYearId], queryFn: () => api.get('/academics/classes', { params: { academicYearId: academicYearId || undefined } }).then(r => r.data.data), staleTime: 120_000 });

  const params = { from, to };
  if (classId)        params.classId        = classId;
  if (academicYearId) params.academicYearId = academicYearId;

  const { data, isLoading } = useQuery({
    queryKey: ['reports-attendance', params],
    queryFn:  () => api.get('/reports/attendance', { params }).then(r => r.data.data),
    staleTime: 60_000,
  });

  const summary  = data?.summary  ?? {};
  const byClass  = data?.byClass  ?? [];
  const byDate   = data?.byDate   ?? [];

  const handleCSV = () => {
    exportCSV(
      byClass.map(c => ({ Class: c.className || c._id, Total: c.total, Present: c.present, Absent: c.absent, 'Present %': c.pct })),
      `attendance-report-${from}-${to}.csv`,
    );
  };

  const maxCount = Math.max(...byDate.map(d => d.total), 1);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Report</h1>
          <p className="page-subtitle">Class and date-range attendance analytics</p>
        </div>
        <button onClick={handleCSV} className="btn btn-ghost btn-md"><Download size={14}/> Export CSV</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={academicYearId} onChange={e => setAcademicYearId(e.target.value)} className="form-select w-40">
          <option value="">All Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
        <select value={classId} onChange={e => setClassId(e.target.value)} className="form-select w-36">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="form-input w-36 text-sm"/>
          <span className="text-slate-400 text-xs">to</span>
          <input type="date" value={to}   onChange={e => setTo(e.target.value)}   className="form-input w-36 text-sm"/>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: summary.total     ?? 0,  color: 'text-slate-700'   },
          { label: 'Present',       value: summary.present   ?? 0,  color: 'text-emerald-600' },
          { label: 'Absent',        value: summary.absent    ?? 0,  color: 'text-red-600'     },
          { label: 'Present %',     value: `${summary.presentPct ?? 0}%`, color: summary.presentPct >= 75 ? 'text-emerald-600' : 'text-amber-600' },
        ].map(k => (
          <div key={k.label} className="card card-body text-center">
            {isLoading ? <div className="skeleton h-12 rounded"/> : <>
              <p className={`text-3xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </>}
          </div>
        ))}
      </div>

      {/* Overall attendance bar */}
      {!isLoading && summary.total > 0 && (
        <div className="card card-body space-y-2">
          <div className="flex justify-between text-sm font-medium text-slate-700">
            <span>Overall Attendance</span>
            <span>{summary.presentPct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${summary.presentPct}%` }}/>
            <div className="bg-amber-400 h-full" style={{ width: `${summary.absentPct}%` }}/>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Present ({summary.present})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Absent ({summary.absent})</span>
            {(summary.late ?? 0) > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>Late ({summary.late})</span>}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* By class */}
        <div className="card overflow-hidden">
          <div className="card-body border-b border-slate-100 py-3">
            <p className="font-semibold text-sm text-slate-700">By Class</p>
          </div>
          {isLoading
            ? <div className="p-4 space-y-2">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-10 rounded"/>)}</div>
            : byClass.length === 0
              ? <div className="p-8 text-center text-slate-400 text-sm">No data for selected filters.</div>
              : (
                <div className="divide-y divide-slate-100">
                  {byClass.map(cls => (
                    <div key={cls._id ?? cls.className} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-sm font-medium text-slate-700 w-20 shrink-0 truncate">{cls.className || 'Unknown'}</span>
                      <MiniBar value={cls.present} max={cls.total} color={cls.pct >= 80 ? 'bg-emerald-500' : cls.pct >= 60 ? 'bg-amber-400' : 'bg-red-500'}/>
                      <div className="text-right shrink-0 w-20">
                        <span className={`text-sm font-bold ${cls.pct >= 80 ? 'text-emerald-600' : cls.pct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{cls.pct}%</span>
                        <span className="text-xs text-slate-400 block">{cls.present}/{cls.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
          }
        </div>

        {/* Daily trend */}
        <div className="card card-body space-y-3">
          <p className="font-semibold text-sm text-slate-700">Daily Trend ({byDate.length} days)</p>
          {isLoading
            ? Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-5 rounded"/>)
            : byDate.length === 0
              ? <p className="text-sm text-slate-400 text-center py-8">No daily data.</p>
              : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {byDate.map(d => {
                    const pct = d.total ? Math.round((d.present / d.total) * 100) : 0;
                    const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-500';
                    return (
                      <div key={d._id} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-20 shrink-0">{dayjs(d._id).format('DD MMM')}</span>
                        <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                          <div className={`h-full ${barColor} rounded`} style={{ width: `${pct}%` }}/>
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}
