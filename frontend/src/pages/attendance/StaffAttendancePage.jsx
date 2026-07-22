import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, CheckCircle2, XCircle, Clock, Umbrella, Monitor } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const STATUS_CONFIG = {
  present:         { label: 'P',   color: 'bg-emerald-500 text-white', ring: 'ring-emerald-300' },
  absent:          { label: 'A',   color: 'bg-red-500 text-white',     ring: 'ring-red-300' },
  late:            { label: 'L',   color: 'bg-amber-500 text-white',   ring: 'ring-amber-300' },
  leave:           { label: 'Lv',  color: 'bg-blue-500 text-white',    ring: 'ring-blue-300' },
  half_day:        { label: 'H',   color: 'bg-purple-500 text-white',  ring: 'ring-purple-300' },
  work_from_home:  { label: 'WFH', color: 'bg-teal-500 text-white',    ring: 'ring-teal-300' },
};

function buildRows(staff, existing) {
  const existingMap = {};
  for (const e of existing) existingMap[String(e.staffId?._id ?? e.staffId)] = e;

  return staff.map(s => {
    const sid = String(s._id);
    const ex  = existingMap[sid];
    return {
      staffId:    s._id,
      userId:     s.userId?._id ?? '',
      name:       `${s.userId?.profile?.firstName ?? ''} ${s.userId?.profile?.lastName ?? ''}`.trim(),
      employeeId: s.employeeId ?? '',
      department: s.department ?? '',
      designation:s.designation ?? '',
      status:     ex?.status ?? 'present',
      checkIn:    ex?.checkIn ?? '',
      checkOut:   ex?.checkOut ?? '',
      remark:     ex?.remark ?? '',
    };
  });
}

export default function StaffAttendancePage() {
  const qc  = useQueryClient();
  const today = dayjs().format('YYYY-MM-DD');
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const { data: staffList = [], isLoading: staffLoading } = useQuery({
    queryKey: ['staff-list'],
    queryFn:  () => api.get('/staff', { params: { limit: 500 } }).then(r => r.data.data),
  });

  const existingQuery = useQuery({
    queryKey: ['staff-attendance', date],
    queryFn:  () => api.get('/attendance/staff', { params: { date } }).then(r => r.data.data),
    enabled:  !!date,
  });

  const isReady = !staffLoading && existingQuery.isSuccess;
  if (isReady && !loaded) {
    setRows(buildRows(staffList, existingQuery.data ?? []));
    setLoaded(true);
  }

  const saveMut = useMutation({
    mutationFn: () => api.post('/attendance/staff', {
      date,
      entries: rows.map(r => ({
        staffId:  r.staffId,
        userId:   r.userId,
        status:   r.status,
        checkIn:  r.checkIn,
        checkOut: r.checkOut,
        remark:   r.remark,
      })),
    }),
    onSuccess: () => { toast.success('Staff attendance saved'); qc.invalidateQueries(['staff-attendance', date]); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  function setField(staffId, field, value) {
    setRows(prev => prev.map(r => String(r.staffId) === String(staffId) ? { ...r, [field]: value } : r));
  }

  function markAll(status) { setRows(prev => prev.map(r => ({ ...r, status }))); }

  const summary = useMemo(() => {
    const s = { present: 0, absent: 0, late: 0, leave: 0, half_day: 0, work_from_home: 0 };
    for (const r of rows) s[r.status] = (s[r.status] || 0) + 1;
    return s;
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Attendance</h1>
          <p className="page-subtitle">Record daily attendance for all staff members</p>
        </div>
      </div>

      {/* Date selector */}
      <div className="card card-body flex items-end gap-4">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input w-40" value={date} max={today}
            onChange={e => { setDate(e.target.value); setLoaded(false); }}/>
        </div>
        <div className="flex gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => markAll(key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${cfg.color} opacity-80 hover:opacity-100`}>
              All {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {loaded && rows.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="card card-body !py-3 text-center">
              <p className="text-xl font-bold text-slate-800">{summary[key] ?? 0}</p>
              <p className="text-[11px] text-slate-400 capitalize">{key.replace(/_/g,' ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Staff table */}
      {loaded && rows.length > 0 && (
        <>
          <div className="card overflow-hidden">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Staff Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Department</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center hidden md:table-cell">Check In</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center hidden md:table-cell">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={String(row.staffId)} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                          {row.name.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{row.name || '—'}</p>
                          <p className="text-xs text-slate-400">{row.employeeId} · {row.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{row.department || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-center">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button key={key} onClick={() => setField(row.staffId, 'status', key)}
                            title={key.replace(/_/g,' ')}
                            className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all
                              ${row.status === key ? `${cfg.color} ring-2 ${cfg.ring} ring-offset-1 scale-110` : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <input type="time" value={row.checkIn}
                        onChange={e => setField(row.staffId, 'checkIn', e.target.value)}
                        className="input w-28 text-xs text-center"/>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <input type="time" value={row.checkOut}
                        onChange={e => setField(row.staffId, 'checkOut', e.target.value)}
                        className="input w-28 text-xs text-center"/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
              className="btn btn-primary btn-md">
              {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              <Save size={16}/> Save Attendance
            </button>
          </div>
        </>
      )}

      {loaded && rows.length === 0 && (
        <div className="card card-body text-center py-12 text-slate-400">No staff records found.</div>
      )}

      {!loaded && (staffLoading || existingQuery.isLoading) && (
        <div className="space-y-2">{Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
      )}
    </div>
  );
}
