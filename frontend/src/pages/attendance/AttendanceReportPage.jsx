import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, User, Users } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const STATUS_COLORS = {
  present:  'bg-emerald-500',
  absent:   'bg-red-400',
  late:     'bg-amber-400',
  leave:    'bg-blue-400',
  half_day: 'bg-purple-400',
};
const STATUS_TEXT = {
  present:  'text-emerald-600',
  absent:   'text-red-500',
  late:     'text-amber-500',
  leave:    'text-blue-500',
  half_day: 'text-purple-500',
};

function StatusDot({ status, size = 'sm' }) {
  const cls = STATUS_COLORS[status] ?? 'bg-slate-300';
  return <span className={`inline-block rounded-full ${size === 'xs' ? 'w-2 h-2' : 'w-2.5 h-2.5'} ${cls}`}/>;
}

export default function AttendanceReportPage() {
  const [tab, setTab]         = useState('class');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [year,  setYear]      = useState(String(dayjs().year()));
  const [month, setMonth]     = useState(String(dayjs().month() + 1));

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

  // Class monthly report
  const classReportQuery = useQuery({
    queryKey: ['class-attendance-report', classId, sectionId, year, month],
    queryFn:  () => api.get('/attendance/students/class-report', { params: { classId, sectionId, year, month } }).then(r => r.data.data),
    enabled:  !!(tab === 'class' && classId && sectionId && year && month),
  });

  // Students for class (to show names in the grid)
  const studentsQuery = useQuery({
    queryKey: ['students-for-class', classId, sectionId],
    queryFn:  () => api.get('/attendance/students/for-class', { params: { classId, sectionId } }).then(r => r.data.data),
    enabled:  !!(classId && sectionId),
  });

  const students = studentsQuery.data ?? [];
  const records  = classReportQuery.data ?? [];

  // Build: date → studentId → status map
  const grid = useMemo(() => {
    const map = {};
    for (const rec of records) {
      const d = dayjs(rec.date).format('D');
      map[d] = {};
      for (const e of rec.entries ?? []) map[d][String(e.studentId)] = e.status;
    }
    return map;
  }, [records]);

  // Days in selected month
  const daysInMonth = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).daysInMonth();
  const dayNumbers  = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Summary per student
  const studentSummary = useMemo(() => {
    const s = {};
    for (const student of students) {
      const sid = String(student._id);
      const stat = { present:0, absent:0, late:0, leave:0, half_day:0, total:0 };
      for (const dayData of Object.values(grid)) {
        if (dayData[sid]) { stat[dayData[sid]] = (stat[dayData[sid]] || 0) + 1; stat.total++; }
      }
      stat.pct = stat.total ? Math.round(((stat.present + stat.late + stat.half_day * 0.5) / stat.total) * 100) : 0;
      s[sid] = stat;
    }
    return s;
  }, [students, grid]);

  const months = Array.from({ length: 12 }, (_, i) => ({ val: String(i+1), label: dayjs().month(i).format('MMMM') }));
  const calYears = [String(dayjs().year() - 1), String(dayjs().year()), String(dayjs().year() + 1)];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Reports</h1>
          <p className="page-subtitle">Monthly attendance calendar and student summaries</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {[{key:'class',label:'Class Report',icon:Users},{key:'student',label:'Student Report',icon:User}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <t.icon size={15}/> {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Class</label>
          <select className="input w-36" value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Section</label>
          <select className="input w-32" value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId}>
            <option value="">Section</option>
            {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Year</label>
          <select className="input w-24" value={year} onChange={e => setYear(e.target.value)}>
            {calYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Month</label>
          <select className="input w-32" value={month} onChange={e => setMonth(e.target.value)}>
            {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {tab === 'class' && classId && sectionId && (
        <>
          {classReportQuery.isLoading
            ? <div className="skeleton h-64 rounded-xl"/>
            : records.length === 0
              ? <div className="card card-body text-center text-slate-400 py-12">No attendance data for this month.</div>
              : (
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-200 p-2 text-left font-semibold text-slate-600 w-36 sticky left-0 bg-slate-50 z-10">Student</th>
                        {dayNumbers.map(d => (
                          <th key={d} className="border border-slate-200 p-1 text-center font-medium text-slate-500 w-7">{d}</th>
                        ))}
                        <th className="border border-slate-200 p-2 text-center font-semibold text-slate-600 w-16">P%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => {
                        const sid    = String(s._id);
                        const sum    = studentSummary[sid] ?? {};
                        const name   = `${s.userId?.profile?.firstName ?? ''} ${s.userId?.profile?.lastName ?? ''}`.trim();
                        return (
                          <tr key={s._id} className="hover:bg-slate-50">
                            <td className="border border-slate-200 px-2 py-1.5 sticky left-0 bg-white z-10">
                              <p className="font-medium text-slate-700 truncate max-w-[130px]">{name}</p>
                              {s.rollNumber && <p className="text-slate-400 text-[10px]">{s.rollNumber}</p>}
                            </td>
                            {dayNumbers.map(d => {
                              const status = grid[String(d)]?.[sid];
                              const color  = STATUS_COLORS[status];
                              return (
                                <td key={d} className="border border-slate-100 p-0.5 text-center">
                                  {status
                                    ? <div title={status} className={`w-5 h-5 rounded mx-auto ${color} opacity-80`}/>
                                    : <div className="w-5 h-5 rounded mx-auto bg-slate-100"/>
                                  }
                                </td>
                              );
                            })}
                            <td className="border border-slate-200 p-2 text-center">
                              <span className={`font-bold text-sm ${sum.pct >= 75 ? 'text-emerald-600' : sum.pct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                {sum.pct ?? 0}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
          }

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            {Object.entries(STATUS_COLORS).map(([key, cls]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${cls}`}/> {key.replace('_',' ')}
              </span>
            ))}
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100"/> No data</span>
          </div>
        </>
      )}

      {tab === 'student' && (
        <StudentReport classId={classId} sectionId={sectionId} students={students} year={year} month={month}/>
      )}

      {(!classId || !sectionId) && (
        <div className="card card-body flex items-center justify-center h-40">
          <p className="text-slate-400 text-sm">Select a class and section to view reports.</p>
        </div>
      )}
    </div>
  );
}

function StudentReport({ classId, sectionId, students, year, month }) {
  const [studentId, setStudentId] = useState('');

  const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
  const endDate   = dayjs(startDate).endOf('month').format('YYYY-MM-DD');

  const reportQuery = useQuery({
    queryKey: ['student-attendance-report', studentId, startDate, endDate],
    queryFn:  () => api.get('/attendance/students/report', { params: { studentId, startDate, endDate } }).then(r => r.data.data),
    enabled:  !!studentId,
  });

  const data = reportQuery.data;

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Select Student</label>
        <select className="input w-64" value={studentId} onChange={e => setStudentId(e.target.value)} disabled={!classId || !sectionId}>
          <option value="">Pick a student…</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>
              {s.userId?.profile?.firstName} {s.userId?.profile?.lastName} {s.rollNumber ? `(${s.rollNumber})` : ''}
            </option>
          ))}
        </select>
      </div>

      {reportQuery.isLoading && <div className="skeleton h-48 rounded-xl"/>}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['present','absent','late','leave','half_day'].map(key => (
              <div key={key} className="card card-body !py-3 text-center">
                <p className={`text-2xl font-bold ${STATUS_TEXT[key]}`}>{data.summary[key] ?? 0}</p>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{key.replace('_',' ')}</p>
              </div>
            ))}
          </div>

          <div className="card card-body flex items-center gap-4">
            <BarChart2 size={20} className="text-primary-500"/>
            <div>
              <p className="text-sm text-slate-500">{data.totalDays} school days tracked</p>
            </div>
            <div className="ml-auto text-right">
              <p className={`text-3xl font-bold ${data.attendancePct >= 75 ? 'text-emerald-600' : data.attendancePct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {data.attendancePct}%
              </p>
              <p className="text-xs text-slate-400">Attendance Rate</p>
            </div>
          </div>

          {/* Daily log */}
          <div className="card overflow-hidden">
            <div className="card-header">
              <p className="font-semibold text-slate-700">Daily Log</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {data.entries.map((e, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <StatusDot status={e.status}/>
                  <p className="text-sm text-slate-600 flex-1">{dayjs(e.date).format('ddd, DD MMM YYYY')}</p>
                  <span className={`text-xs font-semibold capitalize ${STATUS_TEXT[e.status]}`}>{e.status.replace('_',' ')}</span>
                  {e.remark && <p className="text-xs text-slate-400">{e.remark}</p>}
                </div>
              ))}
              {data.entries.length === 0 && <p className="px-4 py-6 text-sm text-slate-400">No entries for this period.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
