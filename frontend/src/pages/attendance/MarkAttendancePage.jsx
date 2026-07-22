import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, Umbrella, Users, Save, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const STATUS_CONFIG = {
  present:  { label: 'P',  color: 'bg-emerald-500 text-white', icon: CheckCircle2, ring: 'ring-emerald-300' },
  absent:   { label: 'A',  color: 'bg-red-500 text-white',     icon: XCircle,      ring: 'ring-red-300' },
  late:     { label: 'L',  color: 'bg-amber-500 text-white',   icon: Clock,        ring: 'ring-amber-300' },
  leave:    { label: 'Lv', color: 'bg-blue-500 text-white',    icon: Umbrella,     ring: 'ring-blue-300' },
  half_day: { label: 'H',  color: 'bg-purple-500 text-white',  icon: null,         ring: 'ring-purple-300' },
};

function initFromStudents(students, existing) {
  const entryMap = {};
  if (existing?.entries) {
    for (const e of existing.entries) entryMap[String(e.studentId)] = e.status;
  }
  return students.map(s => ({
    studentId:  s._id,
    userId:     s.userId?._id ?? '',
    rollNumber: s.rollNumber ?? '',
    name:       `${s.userId?.profile?.firstName ?? ''} ${s.userId?.profile?.lastName ?? ''}`.trim(),
    status:     entryMap[String(s._id)] ?? 'present',
  }));
}

export default function MarkAttendancePage() {
  const qc = useQueryClient();
  const today = dayjs().format('YYYY-MM-DD');

  const [date,      setDate]      = useState(today);
  const [classId,   setClassId]   = useState('');
  const [sectionId, setSectionId] = useState('');
  const [rows,      setRows]      = useState([]);
  const [loaded,    setLoaded]    = useState(false);

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  () => api.get('/academics/years').then(r => r.data.data),
  });
  const currentYear = years.find(y => y.isCurrent);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', currentYear?._id],
    queryFn:  () => api.get('/academics/classes', { params: { academicYearId: currentYear._id } }).then(r => r.data.data),
    enabled:  !!currentYear?._id,
  });

  const selectedClass = classes.find(c => c._id === classId);
  const sections      = (selectedClass?.sections ?? []).filter(s => !s.isDeleted);

  const studentsQuery = useQuery({
    queryKey: ['students-for-class', classId, sectionId],
    queryFn:  () => api.get('/attendance/students/for-class', { params: { classId, sectionId } }).then(r => r.data.data),
    enabled:  !!(classId && sectionId),
  });

  const existingQuery = useQuery({
    queryKey: ['attendance', classId, sectionId, date],
    queryFn:  () => api.get('/attendance/students', { params: { classId, sectionId, date } }).then(r => r.data.data),
    enabled:  !!(classId && sectionId && date),
  });

  // Merge students + existing when both are ready
  const isReady = studentsQuery.isSuccess && existingQuery.isSuccess;
  if (isReady && !loaded) {
    const merged = initFromStudents(studentsQuery.data ?? [], existingQuery.data);
    setRows(merged);
    setLoaded(true);
  }

  function resetLoad() { setLoaded(false); }

  const saveMut = useMutation({
    mutationFn: () => api.post('/attendance/students', {
      classId, sectionId, date,
      academicYearId: currentYear?._id,
      entries: rows.map(r => ({ studentId: r.studentId, userId: r.userId, rollNumber: r.rollNumber, status: r.status })),
    }),
    onSuccess: () => {
      toast.success('Attendance saved');
      qc.invalidateQueries(['attendance', classId, sectionId, date]);
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  function setStatus(studentId, status) {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  }

  function markAll(status) { setRows(prev => prev.map(r => ({ ...r, status }))); }

  const summary = useMemo(() => {
    const s = { present: 0, absent: 0, late: 0, leave: 0, half_day: 0 };
    for (const r of rows) s[r.status] = (s[r.status] || 0) + 1;
    return s;
  }, [rows]);

  const pct = rows.length ? Math.round(((summary.present + summary.late) / rows.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mark Attendance</h1>
          <p className="page-subtitle">Record daily student attendance by class</p>
        </div>
      </div>

      {/* Selector bar */}
      <div className="card card-body flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input w-40" value={date}
            onChange={e => { setDate(e.target.value); resetLoad(); }} max={today}/>
        </div>
        <div>
          <label className="label">Class</label>
          <select className="input w-36" value={classId}
            onChange={e => { setClassId(e.target.value); setSectionId(''); resetLoad(); }}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Section</label>
          <select className="input w-32" value={sectionId}
            onChange={e => { setSectionId(e.target.value); resetLoad(); }} disabled={!classId}>
            <option value="">Section</option>
            {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
          </select>
        </div>
        {classId && sectionId && loaded && (
          <button onClick={resetLoad} className="btn btn-ghost btn-sm mb-0.5 text-slate-500">
            <RefreshCw size={14}/> Reload
          </button>
        )}
      </div>

      {/* Attendance sheet */}
      {classId && sectionId && loaded && rows.length > 0 && (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="card card-body !py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${cfg.color}`}>{cfg.label}</div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{summary[key] ?? 0}</p>
                  <p className="text-xs text-slate-400 capitalize">{key.replace('_',' ')}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance % bar */}
          <div className="card card-body !py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-slate-600">Attendance Rate</p>
              <p className="text-sm font-bold text-slate-800">{pct}%</p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }}/>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-slate-500 font-medium">{rows.length} students</p>
            <div className="flex gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => markAll(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${cfg.color} opacity-80 hover:opacity-100`}>
                  All {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Student rows */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-20">Roll No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.studentId} className={`border-b border-slate-100 last:border-0 ${row.status === 'absent' ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3 text-sm text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {row.name.charAt(0) || '?'}
                        </div>
                        <p className="font-medium text-slate-800 text-sm">{row.name || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">{row.rollNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button key={key} onClick={() => setStatus(row.studentId, key)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                              ${row.status === key ? `${cfg.color} ring-2 ${cfg.ring} ring-offset-1 scale-110` : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
              className="btn btn-primary btn-md">
              {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              <Save size={16}/> Save Attendance
            </button>
          </div>
        </>
      )}

      {classId && sectionId && loaded && rows.length === 0 && (
        <div className="card card-body flex items-center justify-center h-40">
          <div className="text-center">
            <Users size={32} className="mx-auto text-slate-200 mb-2"/>
            <p className="text-slate-400 text-sm">No students enrolled in this class/section.</p>
          </div>
        </div>
      )}

      {(!classId || !sectionId) && (
        <div className="card card-body flex items-center justify-center h-40">
          <p className="text-slate-400 text-sm">Select a class and section to start marking attendance.</p>
        </div>
      )}
    </div>
  );
}
