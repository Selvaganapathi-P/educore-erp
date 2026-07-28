import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const STATUS_OPTS = ['present', 'absent', 'leave', 'half_day', 'late'];
const STATUS_COLORS = {
  present:  'bg-green-100 text-green-700',
  absent:   'bg-red-100 text-red-700',
  leave:    'bg-yellow-100 text-yellow-700',
  half_day: 'bg-blue-100 text-blue-700',
  late:     'bg-orange-100 text-orange-700',
};

export default function AttendancePage() {
  const [cls, setCls]       = useState('');
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [records, setRecords]   = useState({});
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [view, setView]         = useState('mark'); // 'mark' | 'report'
  const [reportCls, setReportCls] = useState('');
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState([]);

  const loadStudents = async () => {
    if (!cls) return;
    setLoading(true);
    try {
      const r = await api.get(`/students?class=${cls}&limit=100`);
      const list = r.data.data;
      setStudents(list);
      // Load existing attendance
      const att = await api.get(`/attendance?class=${cls}&date=${date}`);
      const map = {};
      att.data.data.forEach(a => { map[a.studentId._id] = a.status; });
      const init = {};
      list.forEach(s => { init[s._id] = map[s._id] || 'present'; });
      setRecords(init);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (cls && view === 'mark') loadStudents(); }, [cls, date, view]);

  const save = async () => {
    if (!cls || !date) { toast.error('Select class and date'); return; }
    setSaving(true);
    try {
      const recs = Object.entries(records).map(([studentId, status]) => ({ studentId, status }));
      await api.post('/attendance/mark', { date, records: recs });
      toast.success('Attendance saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const loadReport = async () => {
    if (!reportCls || !reportMonth) { toast.error('Select class and month'); return; }
    setLoading(true);
    try {
      const [year, month] = reportMonth.split('-');
      const r = await api.get(`/attendance?class=${reportCls}&month=${month}&year=${year}`);
      setReportData(r.data.data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <div className="flex gap-2">
          <button onClick={() => setView('mark')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'mark' ? 'bg-blue-700 text-white' : 'border text-gray-600 hover:bg-gray-50'}`}>Mark</button>
          <button onClick={() => setView('report')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'report' ? 'bg-blue-700 text-white' : 'border text-gray-600 hover:bg-gray-50'}`}>Report</button>
        </div>
      </div>

      {view === 'mark' && (
        <>
          <div className="bg-white rounded-xl border p-4 mb-5 flex flex-col sm:flex-row gap-3">
            <select value={cls} onChange={e => setCls(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Class</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Class {n}</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {loading && <p className="text-gray-500 text-sm py-8 text-center">Loading...</p>}

          {students.length > 0 && (
            <>
              <div className="bg-white rounded-xl border overflow-hidden mb-4">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-sm">Class {cls} — {new Date(date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  <div className="flex gap-2">
                    {STATUS_OPTS.map(s => (
                      <button key={s} onClick={() => setRecords(Object.fromEntries(students.map(st => [st._id, s])))}
                        className={`text-xs px-2 py-1 rounded capitalize ${STATUS_COLORS[s]}`}>
                        All {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Roll</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.map(s => (
                        <tr key={s._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{s.rollNumber || '—'}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {STATUS_OPTS.map(st => (
                                <button key={st} onClick={() => setRecords(r => ({ ...r, [s._id]: st }))}
                                  className={`text-xs px-2.5 py-1 rounded-full capitalize border transition-all ${records[s._id] === st ? `${STATUS_COLORS[st]} border-transparent font-semibold` : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                                  {st.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </>
          )}
        </>
      )}

      {view === 'report' && (
        <>
          <div className="bg-white rounded-xl border p-4 mb-5 flex flex-col sm:flex-row gap-3">
            <select value={reportCls} onChange={e => setReportCls(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Class</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Class {n}</option>)}
            </select>
            <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={loadReport} className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">Load</button>
          </div>

          {reportData.length > 0 ? (
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reportData.map(a => (
                      <tr key={a._id}>
                        <td className="px-4 py-3 text-gray-600">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3 font-medium">{a.studentId?.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[a.status]}`}>
                            {a.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            !loading && <p className="text-gray-400 text-sm text-center py-12">Select class and month, then click Load.</p>
          )}
        </>
      )}
    </div>
  );
}
