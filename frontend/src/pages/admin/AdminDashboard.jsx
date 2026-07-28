import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarCheck, FileText, CreditCard, Plus, TrendingUp } from 'lucide-react';
import api from '../../lib/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, byClass: [] });
  const [feeStats, setFeeStats] = useState({ collectedAmount: 0, pendingCount: 0 });

  useEffect(() => {
    api.get('/students/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/fees/stats').then(r => setFeeStats(r.data.data)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Students',   value: stats.total,                     icon: Users,         color: 'blue',  to: '/admin/students' },
    { label: 'Attendance Today', value: '—',                              icon: CalendarCheck, color: 'green', to: '/admin/attendance' },
    { label: 'Results Published', value: '—',                             icon: FileText,      color: 'purple', to: '/admin/results' },
    { label: 'Fees Collected',   value: `₹${(feeStats.collectedAmount||0).toLocaleString('en-IN')}`, icon: CreditCard, color: 'orange', to: '/admin/fees' },
  ];

  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/admin/students/new" className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Student
        </Link>
      </div>

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
            ['Add Student',    '/admin/students/new', 'bg-blue-700 text-white hover:bg-blue-800'],
            ['Mark Attendance','/admin/attendance',   'bg-green-700 text-white hover:bg-green-800'],
            ['Enter Results',  '/admin/results',      'bg-purple-700 text-white hover:bg-purple-800'],
            ['Manage Fees',    '/admin/fees',         'bg-orange-600 text-white hover:bg-orange-700'],
          ].map(([label, to, cls]) => (
            <Link key={label} to={to} className={`text-center py-3 rounded-lg text-sm font-medium transition-colors ${cls}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
