import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarCheck, FileText, CreditCard, Plus, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';

export default function AdminDashboard() {
  const [stats, setStats]       = useState({ total: 0, byClass: [] });
  const [feeStats, setFeeStats] = useState({ collectedAmount: 0, pendingCount: 0 });
  const [error, setError]       = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/students/stats'),
      api.get('/fees/stats'),
    ]).then(([sRes, fRes]) => {
      setStats(sRes.data.data);
      setFeeStats(fRes.data.data);
    }).catch(err => {
      setError(err?.response?.data?.message || 'Could not load dashboard data. Check your backend connection.');
    });
  }, []);

  const cards = [
    { label: 'Total Students',    value: stats.total,
      icon: Users, color: 'blue', to: '/admin/students' },
    { label: 'Mark Attendance',   value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      icon: CalendarCheck, color: 'green', to: '/admin/attendance' },
    { label: 'Results',           value: '—',
      icon: FileText, color: 'purple', to: '/admin/results' },
    { label: 'Fees Collected',    value: `₹${(feeStats.collectedAmount || 0).toLocaleString('en-IN')}`,
      icon: CreditCard, color: 'orange', to: '/admin/fees' },
  ];

  const colors = {
    blue:   'bg-blue-50   text-blue-600',
    green:  'bg-green-50  text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/admin/students/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Student
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <strong>Connection issue:</strong> {error}
          <br />
          <span className="text-red-500 text-xs mt-1 block">
            Make sure VITE_API_URL is set in Vercel and the backend is running on Render.
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Getting Started — shown when no students yet */}
      {!error && stats.total === 0 && (
        <div className="bg-white rounded-xl border border-blue-100 p-8 mb-6">
          <div className="text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg mb-2">Welcome to EduCore Admin</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Your portal is set up. Start by adding students, then you can mark attendance, enter results, and manage fees.
            </p>
            <div className="grid grid-cols-1 gap-3 text-left">
              {[
                ['1', 'Add your first student', '/admin/students/new', 'blue'],
                ['2', 'Mark attendance for a class', '/admin/attendance', 'green'],
                ['3', 'Enter exam results', '/admin/results', 'purple'],
                ['4', 'Create a fee record', '/admin/fees', 'orange'],
              ].map(([num, label, to, color]) => (
                <Link key={num} to={to}
                  className={`flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow ${colors[color]} bg-opacity-10`}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">{num}</span>
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Class distribution */}
      {stats.byClass.length > 0 && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Students by Class</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {stats.byClass.map(({ _id, count }) => (
              <div key={_id} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-blue-700">{count}</p>
                <p className="text-xs text-gray-500">Class {_id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Add Student',     '/admin/students/new', 'bg-blue-700   text-white hover:bg-blue-800'],
            ['Mark Attendance', '/admin/attendance',   'bg-green-700  text-white hover:bg-green-800'],
            ['Enter Results',   '/admin/results',      'bg-purple-700 text-white hover:bg-purple-800'],
            ['Manage Fees',     '/admin/fees',         'bg-orange-600 text-white hover:bg-orange-700'],
          ].map(([label, to, cls]) => (
            <Link key={label} to={to}
              className={`text-center py-3 rounded-lg text-sm font-medium transition-colors ${cls}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
