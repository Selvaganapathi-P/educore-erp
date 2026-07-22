import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

function mergeStudentsWithMarks(students, existingMarks) {
  const marksMap = {};
  for (const m of existingMarks) marksMap[String(m.studentId?._id ?? m.studentId)] = m;

  return students.map(s => {
    const sid = String(s._id);
    const ex  = marksMap[sid];
    return {
      studentId:     s._id,
      userId:        s.userId?._id ?? '',
      rollNumber:    s.rollNumber ?? '',
      name:          `${s.userId?.profile?.firstName ?? ''} ${s.userId?.profile?.lastName ?? ''}`.trim(),
      marksObtained: ex?.marksObtained ?? '',
      isAbsent:      ex?.isAbsent ?? false,
      remarks:       ex?.remarks ?? '',
    };
  });
}

export default function MarkEntryPage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const qc      = useQueryClient();

  const [classId,    setClassId]   = useState('');
  const [sectionId,  setSectionId] = useState('');
  const [scheduleId, setScheduleId]= useState('');
  const [rows, setRows]     = useState([]);
  const [loaded, setLoaded] = useState(false);

  const { data: examData } = useQuery({
    queryKey: ['exam', id],
    queryFn:  () => api.get(`/exams/${id}`).then(r => r.data.data),
    enabled:  !!id,
  });

  const exam     = examData ?? {};
  const schedule = exam.schedule ?? [];

  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data) });
  const currentYear = years.find(y => y.isCurrent);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', currentYear?._id],
    queryFn:  () => api.get('/academics/classes', { params: { academicYearId: currentYear._id } }).then(r => r.data.data),
    enabled:  !!currentYear?._id,
  });

  const selectedClass = classes.find(c => c._id === classId);
  const sections      = (selectedClass?.sections ?? []).filter(s => !s.isDeleted);

  // Filtered schedule slots for selected class
  const classSlots = useMemo(() => schedule.filter(s => String(s.classId?._id ?? s.classId) === String(classId)), [schedule, classId]);
  const selectedSlot = classSlots.find(s => s._id === scheduleId);

  const studentsQuery = useQuery({
    queryKey: ['exam-students', classId, sectionId],
    queryFn:  () => api.get(`/exams/${id}/students`, { params: { classId, sectionId } }).then(r => r.data.data),
    enabled:  !!(classId && sectionId),
  });

  const existingQuery = useQuery({
    queryKey: ['exam-marks', id, scheduleId, sectionId],
    queryFn:  () => api.get(`/exams/${id}/schedule/${scheduleId}/marks`, { params: { sectionId } }).then(r => r.data.data),
    enabled:  !!(scheduleId && sectionId),
  });

  const isReady = studentsQuery.isSuccess && existingQuery.isSuccess && scheduleId && sectionId;
  if (isReady && !loaded) {
    setRows(mergeStudentsWithMarks(studentsQuery.data ?? [], existingQuery.data ?? []));
    setLoaded(true);
  }

  function resetLoad() { setLoaded(false); }

  const saveMut = useMutation({
    mutationFn: () => api.post(`/exams/${id}/schedule/${scheduleId}/marks`, {
      sectionId,
      entries: rows.map(r => ({
        studentId:     r.studentId,
        userId:        r.userId,
        rollNumber:    r.rollNumber,
        marksObtained: r.isAbsent ? 0 : Number(r.marksObtained) || 0,
        isAbsent:      r.isAbsent,
        remarks:       r.remarks,
      })),
    }),
    onSuccess: () => { toast.success('Marks saved'); qc.invalidateQueries(['exam-marks']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  function setField(studentId, field, value) {
    setRows(prev => prev.map(r => String(r.studentId) === String(studentId) ? { ...r, [field]: value } : r));
  }

  function markAllPresent() { setRows(prev => prev.map(r => ({ ...r, isAbsent: false }))); }

  const summary = useMemo(() => {
    const present = rows.filter(r => !r.isAbsent).length;
    const absent  = rows.filter(r => r.isAbsent).length;
    const entered = rows.filter(r => !r.isAbsent && r.marksObtained !== '').length;
    return { present, absent, entered, total: rows.length };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/exams/${id}`)} className="btn btn-icon btn-ghost"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="page-title">Mark Entry</h1>
            <p className="page-subtitle">{exam.name ?? 'Enter marks per subject'}</p>
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div className="card card-body flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Class</label>
          <select className="input w-36" value={classId} onChange={e => { setClassId(e.target.value); setScheduleId(''); setSectionId(''); resetLoad(); }}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Section</label>
          <select className="input w-32" value={sectionId} onChange={e => { setSectionId(e.target.value); resetLoad(); }} disabled={!classId}>
            <option value="">Section</option>
            {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Subject (Schedule Slot)</label>
          <select className="input w-52" value={scheduleId} onChange={e => { setScheduleId(e.target.value); resetLoad(); }} disabled={!classId}>
            <option value="">Select subject slot</option>
            {classSlots.map(s => (
              <option key={s._id} value={s._id}>
                {s.subjectId?.name ?? s.subjectName} — {new Date(s.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })} (/{s.maxMarks})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      {loaded && rows.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total',   value: summary.total,   color: 'text-slate-700' },
            { label: 'Present', value: summary.present, color: 'text-emerald-600' },
            { label: 'Absent',  value: summary.absent,  color: 'text-red-500' },
            { label: 'Entered', value: `${summary.entered}/${summary.present}`, color: 'text-primary-600' },
          ].map(s => (
            <div key={s.label} className="card card-body !py-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mark entry table */}
      {loaded && rows.length > 0 && selectedSlot && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Entering marks for <strong className="text-slate-700">{selectedSlot.subjectId?.name ?? selectedSlot.subjectName}</strong>
              {' — '} Max: <strong>{selectedSlot.maxMarks}</strong>, Pass: <strong>{selectedSlot.passMark}</strong>
            </p>
            <button onClick={markAllPresent} className="btn btn-ghost btn-sm text-slate-500">
              <CheckSquare size={14}/> All Present
            </button>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-20">Roll No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center w-20">Absent</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center w-32">Marks / {selectedSlot.maxMarks}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center w-20">Grade</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-40">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const marks = Number(row.marksObtained);
                  const pct   = selectedSlot.maxMarks ? (marks / selectedSlot.maxMarks) * 100 : 0;
                  const grade = row.isAbsent ? 'AB' : pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : row.marksObtained !== '' ? 'F' : '';
                  const gradeColor = { 'A+':'text-emerald-600', 'A':'text-emerald-500', 'B+':'text-blue-500', 'B':'text-blue-400', 'C':'text-amber-500', 'D':'text-orange-500', 'F':'text-red-500', 'AB':'text-slate-400' };

                  return (
                    <tr key={String(row.studentId)} className={`border-b border-slate-100 last:border-0 ${row.isAbsent ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-2 text-sm text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {row.name.charAt(0) || '?'}
                          </div>
                          <p className="text-sm font-medium text-slate-700">{row.name || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-400 font-mono">{row.rollNumber || '—'}</td>
                      <td className="px-4 py-2 text-center">
                        <input type="checkbox" checked={row.isAbsent}
                          onChange={e => { setField(row.studentId, 'isAbsent', e.target.checked); if (e.target.checked) setField(row.studentId, 'marksObtained', ''); }}
                          className="w-4 h-4 rounded text-red-500 accent-red-500"/>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="number" min={0} max={selectedSlot.maxMarks}
                          disabled={row.isAbsent}
                          value={row.marksObtained}
                          onChange={e => setField(row.studentId, 'marksObtained', e.target.value)}
                          className="input w-20 text-center disabled:opacity-40 text-sm"
                          placeholder="—"/>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-sm font-bold ${gradeColor[grade] ?? 'text-slate-300'}`}>{grade}</span>
                      </td>
                      <td className="px-4 py-2">
                        <input className="input w-full text-xs" placeholder="Optional…"
                          value={row.remarks} onChange={e => setField(row.studentId, 'remarks', e.target.value)}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="btn btn-primary btn-md">
              {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              <Save size={16}/> Save Marks
            </button>
          </div>
        </>
      )}

      {(!classId || !sectionId || !scheduleId) && (
        <div className="card card-body flex items-center justify-center h-40">
          <p className="text-slate-400 text-sm">Select a class, section and subject slot to start entering marks.</p>
        </div>
      )}
    </div>
  );
}
