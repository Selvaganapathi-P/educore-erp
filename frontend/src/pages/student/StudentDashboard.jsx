import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { CalendarCheck, FileText, CreditCard, User } from 'lucide-react';
import api from '../../lib/axios';

export default function StudentDashboard() {
  const { user, student } = useAuthStore();
  const [attSummary, setAttSummary] = useState(null);
  const [fees, setFees] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!student?._id) return;
    api.get(`/attendance/summary/${student._id}`).then(r => setAttSummary(r.data.data.summary)).catch(() => {});
    api.get('/fees').then(r => setFees(r.data.data)).catch(() => {});
    api.get('/results').then(r => setResults(r.data.data)).catch(() => {});
  }, [student]);

  const totalDays = attSummary ? attSummary.total : 0;
  const presentDays = attSummary ? attSummary.present : 0;
  const attPct = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;
  const pendingFees = fees.filter(f => f.status !== 'paid').length;
  const latestResult = results[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        {student && (
          <p className="text-gray-500 text-sm mt-1">Class {student.class}{student.section ? ` – ${student.section}` : ''} | Admission No: {student.admissionNumber}</p>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/student/attendance" className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <CalendarCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{attPct}%</p>
          <p className="text-xs text-gray-500 mt-1">Attendance</p>
          <p className="text-xs text-gray-400">{presentDays}/{totalDays} days</p>
        </Link>

        <Link to="/student/results" className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{latestResult?.grade || '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Latest Grade</p>
          <p className="text-xs text-gray-400">{latestResult?.examType?.replace('_', ' ') || 'No results yet'}</p>
        </Link>

        <Link to="/student/fees" className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${pendingFees > 0 ? 'bg-red-50' : 'bg-orange-50'}`}>
            <CreditCard className={`w-5 h-5 ${pendingFees > 0 ? 'text-red-600' : 'text-orange-600'}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingFees}</p>
          <p className="text-xs text-gray-500 mt-1">Pending Fees</p>
        </Link>

        <Link to="/student/profile" className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">✓</p>
          <p className="text-xs text-gray-500 mt-1">My Profile</p>
        </Link>
      </div>

      {/* Profile summary */}
      {student && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">My Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              ['Admission No', student.admissionNumber],
              ['Class', `${student.class}${student.section ? ` – ${student.section}` : ''}`],
              ['Roll No', student.rollNumber || '—'],
              ['Academic Year', student.academicYear],
              ['Email', student.email],
              ['Phone', student.phone || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-gray-500">{k}</p>
                <p className="font-medium text-gray-900 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
