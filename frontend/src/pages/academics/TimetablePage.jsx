import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DEFAULT_PERIODS = [
  { no: 1, start: '08:00', end: '08:45' },
  { no: 2, start: '08:45', end: '09:30' },
  { no: 3, start: '09:30', end: '10:15' },
  { no: 4, start: '10:15', end: '10:30', isBreak: true, label: 'Short Break' },
  { no: 5, start: '10:30', end: '11:15' },
  { no: 6, start: '11:15', end: '12:00' },
  { no: 7, start: '12:00', end: '12:45', isBreak: true, label: 'Lunch Break' },
  { no: 8, start: '12:45', end: '13:30' },
  { no: 9, start: '13:30', end: '14:15' },
];

function buildEmptyGrid() {
  const grid = {};
  for (const day of DAYS) {
    grid[day] = DEFAULT_PERIODS.map(p => ({
      periodNo:   p.no,
      startTime:  p.start,
      endTime:    p.end,
      isBreak:    p.isBreak ?? false,
      breakLabel: p.label ?? '',
      subjectId:  '',
      teacherId:  '',
      roomNo:     '',
    }));
  }
  return grid;
}

function gridFromData(schedule) {
  if (!schedule?.length) return buildEmptyGrid();
  const grid = {};
  for (const daySchedule of schedule) {
    const dayName = DAYS[daySchedule.day];
    if (!dayName) continue;
    grid[dayName] = daySchedule.periods.map(p => ({
      periodNo:   p.periodNo,
      startTime:  p.startTime,
      endTime:    p.endTime,
      isBreak:    p.isBreak ?? false,
      breakLabel: p.breakLabel ?? '',
      subjectId:  p.subjectId?._id ?? p.subjectId ?? '',
      teacherId:  p.teacherId?._id ?? p.teacherId ?? '',
      roomNo:     p.roomNo ?? '',
    }));
  }
  for (const day of DAYS) {
    if (!grid[day]) grid[day] = DEFAULT_PERIODS.map(p => ({ periodNo: p.no, startTime: p.start, endTime: p.end, isBreak: false, breakLabel: '', subjectId: '', teacherId: '', roomNo: '' }));
  }
  return grid;
}

export default function TimetablePage() {
  const qc = useQueryClient();
  const [yearId,    setYearId]    = useState('');
  const [classId,   setClassId]   = useState('');
  const [sectionId, setSectionId] = useState('');
  const [grid, setGrid]           = useState(buildEmptyGrid());
  const [dirty, setDirty]         = useState(false);

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  () => api.get('/academics/years').then(r => r.data.data),
  });
  const currentYear = years.find(y => y.isCurrent);
  const effectiveYear = yearId || currentYear?._id || '';

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', effectiveYear],
    queryFn:  () => api.get('/academics/classes', { params: { academicYearId: effectiveYear } }).then(r => r.data.data),
    enabled:  !!effectiveYear,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', effectiveYear],
    queryFn:  () => api.get('/academics/subjects', { params: { academicYearId: effectiveYear } }).then(r => r.data.data),
    enabled:  !!effectiveYear,
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff-list'],
    queryFn:  () => api.get('/staff', { params: { limit: 200 } }).then(r => r.data.data),
  });

  const selectedClass   = classes.find(c => c._id === classId);
  const sections        = (selectedClass?.sections ?? []).filter(s => !s.isDeleted);
  const selectedSection = sections.find(s => s._id === sectionId);

  const { isFetching } = useQuery({
    queryKey:   ['timetable', classId, sectionId],
    queryFn:    () => api.get('/academics/timetable', { params: { classId, sectionId } }).then(r => r.data.data),
    enabled:    !!(classId && sectionId),
    onSuccess:  data => { setGrid(gridFromData(data?.schedule)); setDirty(false); },
  });

  const saveMut = useMutation({
    mutationFn: payload => api.post('/academics/timetable', payload),
    onSuccess:  () => { toast.success('Timetable saved'); setDirty(false); qc.invalidateQueries(['timetable']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  function setCell(day, periodIdx, field, value) {
    setGrid(prev => {
      const next = { ...prev, [day]: prev[day].map((p, i) => i === periodIdx ? { ...p, [field]: value } : p) };
      return next;
    });
    setDirty(true);
  }

  function handleSave() {
    if (!classId || !sectionId) { toast.error('Select a class and section first'); return; }
    const schedule = DAYS.map((day, idx) => ({
      day: idx,
      periods: (grid[day] ?? []).map(p => ({
        periodNo:  p.periodNo,
        startTime: p.startTime,
        endTime:   p.endTime,
        isBreak:   p.isBreak,
        breakLabel:p.breakLabel,
        subjectId: p.isBreak ? undefined : (p.subjectId || undefined),
        teacherId: p.isBreak ? undefined : (p.teacherId || undefined),
        roomNo:    p.roomNo || undefined,
      })),
    }));
    saveMut.mutate({ classId, sectionId, academicYearId: effectiveYear, schedule });
  }

  const subjectMap = useMemo(() => Object.fromEntries(subjects.map(s => [s._id, s])), [subjects]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Timetable</h1>
          <p className="page-subtitle">Visual weekly schedule per class and section</p>
        </div>
        <button onClick={handleSave} disabled={saveMut.isPending || !dirty}
          className="btn btn-primary btn-md disabled:opacity-50">
          {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
          <Save size={16}/> Save Timetable
        </button>
      </div>

      {/* Selector bar */}
      <div className="card card-body flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Academic Year</label>
          <select className="input w-44" value={yearId || effectiveYear} onChange={e => { setYearId(e.target.value); setClassId(''); setSectionId(''); setGrid(buildEmptyGrid()); setDirty(false); }}>
            {years.map(y => <option key={y._id} value={y._id}>{y.name}{y.isCurrent ? ' ★' : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Class</label>
          <select className="input w-40" value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); setGrid(buildEmptyGrid()); setDirty(false); }}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Section</label>
          <select className="input w-36" value={sectionId} onChange={e => { setSectionId(e.target.value); setGrid(buildEmptyGrid()); setDirty(false); }} disabled={!classId}>
            <option value="">Select section</option>
            {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
          </select>
        </div>
        {isFetching && <p className="text-xs text-slate-400 mb-1">Loading…</p>}
      </div>

      {/* Timetable grid */}
      {classId && sectionId ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr>
                <th className="bg-slate-50 border border-slate-200 p-2 text-left text-xs font-semibold text-slate-500 w-20">Period</th>
                {DAYS.map(d => (
                  <th key={d} className="bg-slate-50 border border-slate-200 p-2 text-center text-xs font-semibold text-slate-600">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEFAULT_PERIODS.map((pd, periodIdx) => (
                <tr key={pd.no}>
                  <td className="border border-slate-200 p-2 bg-slate-50 text-center align-top">
                    <p className="text-xs font-semibold text-slate-600">{pd.isBreak ? '' : `P${pd.no}`}</p>
                    <p className="text-[10px] text-slate-400 whitespace-nowrap">{pd.start}–{pd.end}</p>
                  </td>
                  {DAYS.map(day => {
                    const cell = grid[day]?.[periodIdx] ?? {};
                    const subj = subjectMap[cell.subjectId];

                    if (pd.isBreak) {
                      return (
                        <td key={day} className="border border-slate-100 bg-amber-50 p-2 text-center" colSpan={1}>
                          <div className="flex items-center justify-center gap-1 text-amber-600 text-xs">
                            <Coffee size={12}/> {pd.label}
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={day} className="border border-slate-200 p-1 align-top min-w-[130px]">
                        <div className="space-y-1">
                          {subj && (
                            <div className="h-1 rounded-full mb-1" style={{ background: subj.color ?? '#94a3b8' }}/>
                          )}
                          <select
                            value={cell.subjectId ?? ''}
                            onChange={e => setCell(day, periodIdx, 'subjectId', e.target.value)}
                            className="w-full text-xs border-0 bg-slate-50 rounded px-1 py-0.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400 cursor-pointer">
                            <option value="">— Subject —</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                          </select>
                          <select
                            value={cell.teacherId ?? ''}
                            onChange={e => setCell(day, periodIdx, 'teacherId', e.target.value)}
                            className="w-full text-xs border-0 bg-slate-50 rounded px-1 py-0.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-400 cursor-pointer">
                            <option value="">— Teacher —</option>
                            {staffList.map(st => (
                              <option key={st._id} value={st._id}>
                                {st.userId?.profile?.firstName} {st.userId?.profile?.lastName}
                              </option>
                            ))}
                          </select>
                          <input
                            value={cell.roomNo ?? ''}
                            onChange={e => setCell(day, periodIdx, 'roomNo', e.target.value)}
                            placeholder="Room"
                            className="w-full text-xs border-0 bg-slate-50 rounded px-1 py-0.5 text-slate-400 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card card-body flex items-center justify-center h-48">
          <p className="text-slate-400 text-sm">Select a class and section to view or edit the timetable.</p>
        </div>
      )}

      {dirty && (
        <div className="fixed bottom-6 right-6 z-50">
          <button onClick={handleSave} disabled={saveMut.isPending}
            className="btn btn-primary btn-md shadow-lg shadow-primary-200">
            {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            <Save size={16}/> Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
