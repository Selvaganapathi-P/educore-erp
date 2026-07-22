import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center mb-6">
        <ShieldOff className="w-6 h-6 text-danger-600" />
      </div>
      <p className="text-7xl font-bold text-slate-200 mb-4 tabular-nums">403</p>
      <h1 className="text-xl font-semibold text-slate-800 mb-2">Access denied</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        You don't have permission to view this page. Contact your administrator.
      </p>
      <Link to="/" className="btn-primary">Back to dashboard</Link>
    </div>
  );
}
