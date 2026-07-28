import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, ArrowLeft, CalendarCheck, FileText, CreditCard } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-900 mt-0.5 text-sm">{value || '—'}</p>
  </div>
);

const Badge = ({ value, green, red }) => {
  const cls = green ? 'bg-green-100 text-green-700' : red ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600';
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{value}</span>;
};

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attSummary, setAttSummary] = useState(null);
  const [results, setResults]  = useState([]);
  const [fees, setFees]         = useState([]);
  const [tab, setTab]           = useState('profile');

  useEffect(() => {
    api.get(`/students/${id}`).then(r => setStudent(r.data.data)).catch(() => { toast.error('Not found'); navigate('/admin/students'); });
    api.get(`/attendance/summary/${id}`).then(r => setAttSummary(r.data.data.summary)).catch(() => {});
    api.get(`/results?studentId=${id}`).then(r => setResults(r.data.data)).catch(() => {});
    api.get(`/fees?studentId=${id}`).then(r => setFees(r.data.data)).catch(() => {});
  }, [id]);

  if (!student) return <div className="p-8 text-gray-400 text-center">Loading...</div>;

  const pct = attSummary && attSummary.total ? Math.round((attSummary.present / attSummary.total) * 100) : 0;
  const feeTotal   = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const feePaid    = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const feePending = feeTotal - feePaid;

  const gradeColor = (g) => {
    if (g === 'A+' || g === 'A') return 'bg-green-100 text-green-700';
    if (g === 'B+' || g === 'B') return 'bg-blue-100 text-blue-700';
    if (g === 'C' || g === 'D')  return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const tabs = ['profile', 'attendance', 'results', 'fees'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/students')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-sm text-gray-500">Admission No: {student.admissionNumber} · Class {student.class}{student.section ? ` – ${student.section}` : ''}</p>
        </div>
        <Link to={`/admin/students/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
          <Edit className="w-4 h-4" /> Edit
        </Link>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <CalendarCheck className="w-8 h-8 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-xl font-bold text-gray-900">{pct}%</p>
            <p className="text-xs text-gray-500">Attendance ({attSummary?.present || 0}/{attSummary?.total || 0})</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <FileText className="w-8 h-8 text-purple-500 flex-shrink-0" />
          <div>
            <p className="text-xl font-bold text-gray-900">{results[0]?.grade || '—'}</p>
            <p className="text-xs text-gray-500">{results[0]?.examType?.replace('_', ' ') || 'No results'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <CreditCard className={`w-8 h-8 flex-shrink-0 ${feePending > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-xl font-bold text-gray-900">₹{feePending.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500">Fee pending</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name"     value={student.name} />
              <Field label="Gender"        value={student.gender} />
              <Field label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : null} />
              <Field label="Blood Group"   value={student.bloodGroup} />
              <Field label="Father's Name" value={student.fatherName} />
              <Field label="Mother's Name" value={student.motherName} />
              <div className="col-span-2"><Field label="Address" value={student.address} /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Academic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Admission No"   value={student.admissionNumber} />
              <Field label="Academic Year"  value={student.academicYear} />
              <Field label="Class"          value={student.class} />
              <Field label="Section"        value={student.section} />
              <Field label="Roll Number"    value={student.rollNumber} />
              <div className="flex flex-col">
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-1"><Badge value={student.status} green={student.status === 'active'} /></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" value={student.email} />
              <Field label="Phone" value={student.phone} />
            </div>
          </div>
        </div>
      )}

      {/* Attendance tab */}
      {tab === 'attendance' && (
        <div className="bg-white rounded-xl border p-6">
          {attSummary ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Attendance Summary</h3>
                <span className={`text-sm font-bold ${pct >= 75 ? 'text-green-700' : 'text-red-600'}`}>{pct}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full mb-6">
                <div className={`h-full rounded-full ${pct >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[['Total', attSummary.total, 'bg-gray-100'], ['Present', attSummary.present, 'bg-green-100 text-green-800'], ['Absent', attSummary.absent, 'bg-red-100 text-red-800'], ['Leave', attSummary.leave, 'bg-yellow-100 text-yellow-800'], ['Half Day', attSummary.half_day, 'bg-blue-100 text-blue-800'], ['Late', attSummary.late, 'bg-orange-100 text-orange-800']].map(([l, v, c]) => (
                  <div key={l} className={`rounded-xl p-3 text-center ${c}`}>
                    <p className="text-xl font-bold">{v || 0}</p>
                    <p className="text-xs mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-400 text-center py-8">No attendance records found.</p>}
        </div>
      )}

      {/* Results tab */}
      {tab === 'results' && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-400">No results published yet.</div>
          ) : results.map(r => (
            <div key={r._id} className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{r.examType?.replace('_', ' ')} — {r.academicYear}</p>
                  <p className="text-xs text-gray-500">{r.subjects?.length} subjects</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${gradeColor(r.grade)}`}>{r.grade}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.result?.toUpperCase()}</span>
                  <span className="text-sm font-medium text-gray-700">{r.percentage?.toFixed(1)}%</span>
                </div>
              </div>
              <table className="w-full text-sm border-t pt-2">
                <thead><tr className="text-xs text-gray-400"><th className="text-left py-1.5">Subject</th><th className="text-right py-1.5">Marks</th><th className="text-right py-1.5">Max</th></tr></thead>
                <tbody>{r.subjects?.map((s, i) => (<tr key={i} className="border-t"><td className="py-1.5">{s.name}</td><td className="text-right">{s.marks}</td><td className="text-right text-gray-400">{s.maxMarks}</td></tr>))}</tbody>
                <tfoot><tr className="border-t font-semibold"><td className="pt-2">Total</td><td className="pt-2 text-right">{r.totalMarks}</td><td className="pt-2 text-right text-gray-400">{r.totalMaxMarks}</td></tr></tfoot>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Fees tab */}
      {tab === 'fees' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[['Total', `₹${feeTotal.toLocaleString('en-IN')}`, 'text-gray-900'], ['Paid', `₹${feePaid.toLocaleString('en-IN')}`, 'text-green-700'], ['Pending', `₹${feePending.toLocaleString('en-IN')}`, feePending > 0 ? 'text-red-600' : 'text-gray-900']].map(([l, v, c]) => (
              <div key={l} className="bg-white rounded-xl border p-4">
                <p className={`text-lg font-bold ${c}`}>{v}</p>
                <p className="text-xs text-gray-500 mt-1">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>{['Type', 'Amount', 'Paid', 'Status', 'Receipt'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {fees.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No fee records</td></tr>
                  : fees.map(f => (
                    <tr key={f._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 capitalize font-medium">{f.feeType}</td>
                      <td className="px-4 py-3">₹{f.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">₹{(f.paidAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${f.status === 'paid' ? 'bg-green-100 text-green-700' : f.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{f.status}</span></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{f.receiptNo || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
