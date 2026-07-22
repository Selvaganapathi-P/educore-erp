import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Trophy, BookOpen } from 'lucide-react';
import api from '../../lib/axios';
import { exportCSV } from '../../lib/csvExport';

function MiniBar({ value, max, color = 'bg-primary-500' }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}/></div>;
}

export default function AcademicReportPage() {
  const [examId,         setExamId]         = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId,        setClassId]        = useState('');

  const { data: years   = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data), staleTime: 300_000 });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', academicYearId], queryFn: () => api.get('/academics/classes', { params: { academicYearId: academicYearId || undefined } }).then(r => r.data.data), staleTime: 120_000 });

  const params = {};
  if (examId)         params.examId         = examId;
  if (academicYearId) params.academicYearId = academicYearId;
  if (classId)        params.classId        = classId;

  const { data, isLoading } = useQuery({
    queryKey: ['reports-academic', params],
    queryFn:  () => api.get('/reports/academic', { params }).then(r => r.data.data),
    staleTime: 60_000,
  });

  const s           = data?.summary    ?? {};
  const bySubject   = data?.bySubject  ?? [];
  const topStudents = data?.topStudents ?? [];
  const exams       = data?.exams      ?? [];

  const handleExportTop = () => {
    exportCSV(
      topStudents.map((st, i) => ({
        Rank:          i + 1,
        Name:          st.name?.trim() || '—',
        Roll:          st.rollNumber   || '',
        TotalObtained: st.totalObtained,
        TotalMax:      st.totalMax,
        Percentage:    st.pct,
      })),
      'top-students.csv',
    );
  };

  const maxSubjectPct = Math.max(...bySubject.map(s => s.avgPercent ?? 0), 1);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Report</h1>
          <p className="page-subtitle">Exam results, pass rates, and subject-wise performance</p>
        </div>
        <button onClick={handleExportTop} className="btn btn-ghost btn-md"><Download size={14}/> Export Top Students</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={academicYearId} onChange={e => { setAcademicYearId(e.target.value); setExamId(''); }} className="form-select w-44">
          <option value="">All Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
        <select value={classId} onChange={e => setClassId(e.target.value)} className="form-select w-36">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={examId} onChange={e => setExamId(e.target.value)} className="form-select w-52">
          <option value="">All Exams</option>
          {exams.map(e => <option key={e._id} value={e._id}>{e.title}{e.classId?.name ? ` (${e.classId.name})` : ''}</option>)}
        </select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Results', value: s.total    ?? 0,  color: 'text-slate-700'   },
          { label: 'Passed',        value: s.passed   ?? 0,  color: 'text-emerald-600' },
          { label: 'Failed',        value: (s.total ?? 0) - (s.passed ?? 0), color: 'text-red-600' },
          { label: 'Pass %',        value: `${s.passPct ?? 0}%`, color: (s.passPct ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'Avg Score',     value: `${s.avgPercent ?? 0}%`, color: 'text-primary-600' },
        ].map(k => (
          <div key={k.label} className="card card-body text-center py-3">
            {isLoading ? <div className="skeleton h-12 rounded"/> : <>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </>}
          </div>
        ))}
      </div>

      {/* Pass rate bar */}
      {!isLoading && s.total > 0 && (
        <div className="card card-body space-y-2">
          <div className="flex justify-between text-sm font-semibold text-slate-700">
            <span>Pass Rate</span>
            <span>{s.passPct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${(s.passPct ?? 0) >= 80 ? 'bg-emerald-500' : (s.passPct ?? 0) >= 60 ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{ width: `${s.passPct}%` }}/>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{s.passed} passed</span>
            <span>{(s.total ?? 0) - (s.passed ?? 0)} failed {s.absent > 0 ? `· ${s.absent} absent` : ''}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* By subject */}
        <div className="card overflow-hidden">
          <div className="card-body border-b border-slate-100 flex items-center gap-2 py-3">
            <BookOpen size={14} className="text-primary-500"/>
            <p className="font-semibold text-sm text-slate-700">Subject Performance</p>
          </div>
          {isLoading
            ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-10 rounded"/>)}</div>
            : bySubject.length === 0
              ? <div className="p-8 text-center text-slate-400 text-sm">No data.</div>
              : (
                <div className="divide-y divide-slate-100">
                  {bySubject.map(sub => {
                    const color = sub.avgPercent >= 80 ? 'bg-emerald-500' : sub.avgPercent >= 60 ? 'bg-amber-400' : 'bg-red-500';
                    return (
                      <div key={sub._id} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-sm font-medium text-slate-700 w-28 shrink-0 truncate">{sub.subjectName || 'Unknown'}</span>
                        <MiniBar value={sub.avgPercent ?? 0} max={100} color={color}/>
                        <div className="text-right shrink-0 w-24">
                          <p className={`text-sm font-bold ${sub.avgPercent >= 80 ? 'text-emerald-600' : sub.avgPercent >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {sub.avgPercent ?? 0}%
                          </p>
                          <p className="text-xs text-slate-400">{sub.passed}/{sub.total} passed</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          }
        </div>

        {/* Top students */}
        <div className="card overflow-hidden">
          <div className="card-body border-b border-slate-100 flex items-center gap-2 py-3">
            <Trophy size={14} className="text-amber-500"/>
            <p className="font-semibold text-sm text-slate-700">Top Performers</p>
          </div>
          {isLoading
            ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-14 rounded"/>)}</div>
            : topStudents.length === 0
              ? <div className="p-8 text-center text-slate-400 text-sm">No data.</div>
              : (
                <div className="divide-y divide-slate-100">
                  {topStudents.map((st, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
                    return (
                      <div key={st._id} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-base w-8 shrink-0 text-center">{medal}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{st.name?.trim() || '—'}</p>
                          <p className="text-xs text-slate-400">Roll: {st.rollNumber || '—'} · {st.subjectCount} subjects</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-primary-600">{st.pct}%</p>
                          <p className="text-xs text-slate-400">{st.totalObtained}/{st.totalMax}</p>
                        </div>
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
