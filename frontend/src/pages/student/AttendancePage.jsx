import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/axios';

const STATUS_COLORS = {
  present:  'bg-green-100 text-green-700',
  absent:   'bg-red-100 text-red-700',
  leave:    'bg-yellow-100 text-yellow-700',
  half_day: 'bg-blue-100 text-blue-700',
  late:     'bg-orange-100 text-orange-700',
};

export default function StudentAttendancePage() {
  const { student } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?._id) return;
    setLoading(true);
    api.get(`/attendance/summary/${student._id}`).then(r => {
      setSummary(r.data.data.summary);
      setRecords(r.data.data.records || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [student]);

  if (loading) return <p className="text-gray-400">Loading attendance...</p>;
  if (!student) return <p className="text-gray-400">Profile not found.</p>;

  const pct = summary && summary.total ? Math.round((summary.present / summary.total) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Attendance</h1>

      {summary && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          {[
            ['Total', summary.total, 'bg-gray-100 text-gray-700'],
            ['Present', summary.present, 'bg-green-100 text-green-700'],
            ['Absent', summary.absent, 'bg-red-100 text-red-700'],
            ['Leave', summary.leave, 'bg-yellow-100 text-yellow-700'],
            ['Half Day', summary.half_day, 'bg-blue-100 text-blue-700'],
            ['Late', summary.late, 'bg-orange-100 text-orange-700'],
          ].map(([label, value, cls]) => (
            <div key={label} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-2xl font-bold">{value || 0}</p>
              <p className="text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <div className="bg-white rounded-xl border p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
            <span className={`text-sm font-bold ${pct >= 75 ? 'text-green-700' : 'text-red-600'}`}>{pct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
          </div>
          {pct < 75 && <p className="text-xs text-red-500 mt-2">⚠ Attendance below 75%. Please speak to your class teacher.</p>}
        </div>
      )}

      {records.length > 0 ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{new Date(r.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status]}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>No attendance records found.</p>
        </div>
      )}
    </div>
  );
}
