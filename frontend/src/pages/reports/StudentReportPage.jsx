import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Users } from 'lucide-react';
import api from '../../lib/axios';
import { exportCSV } from '../../lib/csvExport';

const GENDER_CFG = { male:'bg-blue-100 text-blue-700', female:'bg-pink-100 text-pink-700', other:'bg-purple-100 text-purple-700' };

export default function StudentReportPage() {
  const [academicYearId, setAcademicYearId] = useState('');

  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data), staleTime: 300_000 });

  const params = {};
  if (academicYearId) params.academicYearId = academicYearId;

  const { data, isLoading } = useQuery({
    queryKey: ['reports-students', params],
    queryFn:  () => api.get('/reports/students', { params }).then(r => r.data.data),
    staleTime: 60_000,
  });

  const byClass  = data?.byClass  ?? [];
  const byGender = data?.byGender ?? [];
  const total    = data?.total    ?? 0;

  const maxCount = Math.max(...byClass.map(c => c.count), 1);

  const handleExport = () => {
    exportCSV(
      byClass.map(c => ({ Class: c.className || c._id, Students: c.count, Percentage: total ? `${Math.round((c.count / total) * 100)}%` : '0%' })),
      'student-enrollment.csv',
    );
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Report</h1>
          <p className="page-subtitle">Enrollment distribution by class and gender</p>
        </div>
        <button onClick={handleExport} className="btn btn-ghost btn-md"><Download size={14}/> Export CSV</button>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select value={academicYearId} onChange={e => setAcademicYearId(e.target.value)} className="form-select w-44">
          <option value="">All Academic Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card card-body text-center">
          {isLoading ? <div className="skeleton h-16 rounded"/> : <>
            <p className="text-4xl font-black text-primary-600">{total.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">Total Students</p>
          </>}
        </div>
        <div className="card card-body text-center">
          {isLoading ? <div className="skeleton h-16 rounded"/> : <>
            <p className="text-4xl font-black text-slate-700">{byClass.length}</p>
            <p className="text-sm text-slate-500 mt-1">Classes</p>
          </>}
        </div>
        <div className="card card-body text-center">
          {isLoading ? <div className="skeleton h-16 rounded"/> : <>
            <p className="text-4xl font-black text-slate-700">{byClass.length > 0 ? Math.round(total / byClass.length) : 0}</p>
            <p className="text-sm text-slate-500 mt-1">Avg per Class</p>
          </>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* By class bar chart */}
        <div className="card card-body space-y-2 lg:col-span-2">
          <p className="font-semibold text-sm text-slate-700">Students by Class</p>
          {isLoading
            ? Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-8 rounded"/>)
            : byClass.length === 0
              ? <p className="text-sm text-slate-400 text-center py-8">No enrollment data.</p>
              : byClass.map(cls => {
                const pct = total ? Math.round((cls.count / total) * 100) : 0;
                return (
                  <div key={cls._id ?? cls.className} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 w-24 shrink-0 truncate">{cls.className || 'Unknown'}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden relative">
                      <div className="h-full bg-primary-400 rounded" style={{ width: `${Math.round((cls.count / maxCount) * 100)}%` }}/>
                      <span className="absolute inset-0 flex items-center pl-2 text-xs font-medium text-white">{cls.count > 5 ? cls.count : ''}</span>
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right shrink-0">{pct}%</span>
                  </div>
                );
              })
          }
        </div>

        {/* Gender breakdown */}
        <div className="card card-body space-y-3">
          <p className="font-semibold text-sm text-slate-700">Gender Distribution</p>
          {isLoading
            ? Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-16 rounded"/>)
            : byGender.length === 0
              ? <p className="text-sm text-slate-400 text-center py-8">No data.</p>
              : (
                <>
                  <div className="flex flex-wrap gap-3">
                    {byGender.map(g => (
                      <div key={g._id} className={`flex-1 rounded-xl px-4 py-3 text-center ${GENDER_CFG[g._id] ?? 'bg-slate-100 text-slate-600'}`}>
                        <p className="text-2xl font-black">{g.count}</p>
                        <p className="text-xs font-medium capitalize">{g._id || 'Unknown'}</p>
                        <p className="text-xs opacity-70">{total ? Math.round((g.count / total) * 100) : 0}%</p>
                      </div>
                    ))}
                  </div>

                  {/* Stacked bar */}
                  <div className="h-3 rounded-full overflow-hidden flex">
                    {byGender.map((g, i) => {
                      const colors = ['bg-blue-400','bg-pink-400','bg-purple-400'];
                      return <div key={g._id} className={colors[i % colors.length]} style={{ width: `${total ? (g.count/total*100) : 0}%` }}/>;
                    })}
                  </div>
                </>
              )
          }

          {/* Class table (compact) */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Class Breakdown</p>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {byClass.map(cls => (
                <div key={cls._id ?? cls.className} className="flex justify-between text-xs py-1 border-b border-slate-50">
                  <span className="text-slate-600">{cls.className || 'Unknown'}</span>
                  <span className="font-medium text-slate-800">{cls.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
