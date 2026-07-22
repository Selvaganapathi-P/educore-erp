import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
        <GraduationCap className="w-5 h-5 text-white" />
      </div>
      <p className="text-7xl font-bold text-slate-200 mb-4 tabular-nums">404</p>
      <h1 className="text-xl font-semibold text-slate-800 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">Go to dashboard</Link>
    </div>
  );
}
