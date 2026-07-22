import { useState } from 'react';
import { Lightbulb, RefreshCw, TrendingUp, Users, DollarSign, Heart, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';

const CATEGORY_CFG = {
  Fees:        { color: 'bg-emerald-50 border-emerald-200 text-emerald-700',  icon: DollarSign, badge: 'bg-emerald-100 text-emerald-700' },
  Attendance:  { color: 'bg-blue-50 border-blue-200 text-blue-700',           icon: BarChart2,  badge: 'bg-blue-100 text-blue-700' },
  Health:      { color: 'bg-rose-50 border-rose-200 text-rose-700',           icon: Heart,      badge: 'bg-rose-100 text-rose-700' },
  Operations:  { color: 'bg-amber-50 border-amber-200 text-amber-700',        icon: TrendingUp, badge: 'bg-amber-100 text-amber-700' },
  Academic:    { color: 'bg-violet-50 border-violet-200 text-violet-700',     icon: Users,      badge: 'bg-violet-100 text-violet-700' },
  HR:          { color: 'bg-cyan-50 border-cyan-200 text-cyan-700',           icon: Users,      badge: 'bg-cyan-100 text-cyan-700' },
};

const PRIORITY_CFG = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-slate-100 text-slate-600',
};

function InsightCard({ insight }) {
  const cfg = CATEGORY_CFG[insight.category] || CATEGORY_CFG.Operations;
  const Icon = cfg.icon;
  return (
    <div className={`rounded-xl border p-4 space-y-2 ${cfg.color}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{insight.category}</span>
        </div>
        {insight.priority && (
          <span className={`text-2xs font-medium px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${PRIORITY_CFG[insight.priority] || 'bg-slate-100 text-slate-600'}`}>
            {insight.priority}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-sm">{insight.title}</h3>
      <p className="text-xs leading-relaxed opacity-90">{insight.description}</p>
      {insight.action && (
        <div className="pt-1 border-t border-current border-opacity-20">
          <p className="text-xs font-medium opacity-80">Action: {insight.action}</p>
        </div>
      )}
    </div>
  );
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [lastRun, setLastRun]   = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/insights');
      setInsights(res.data.data?.insights ?? []);
      setLastRun(new Date());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate insights. Check your AI API key.');
    } finally {
      setLoading(false);
    }
  };

  const highCount   = insights?.filter(i => i.priority === 'high').length ?? 0;
  const mediumCount = insights?.filter(i => i.priority === 'medium').length ?? 0;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI School Insights</h1>
          <p className="page-subtitle">AI-generated analysis of your school's key metrics</p>
        </div>
        <button onClick={fetchInsights} disabled={loading} className="btn btn-primary btn-md gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {insights ? 'Refresh Insights' : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="card card-body text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
            <Lightbulb className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">Ready to analyze your school</p>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Click "Generate Insights" to get AI-powered analysis based on your current school data — fees, attendance, health, and more.</p>
          </div>
          <button onClick={fetchInsights} disabled={loading} className="btn btn-primary btn-md mx-auto gap-2">
            <Lightbulb className="w-4 h-4" /> Generate Insights
          </button>
        </div>
      )}

      {loading && (
        <div className="card card-body text-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="font-semibold text-slate-700">Analyzing your school data...</p>
          <p className="text-sm text-slate-400">This usually takes 5–10 seconds</p>
        </div>
      )}

      {insights && !loading && (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card card-body text-center py-3">
              <p className="text-2xl font-black text-slate-800">{insights.length}</p>
              <p className="text-xs text-slate-500">Total Insights</p>
            </div>
            <div className="card card-body text-center py-3">
              <p className="text-2xl font-black text-red-600">{highCount}</p>
              <p className="text-xs text-slate-500">High Priority</p>
            </div>
            <div className="card card-body text-center py-3">
              <p className="text-2xl font-black text-amber-600">{mediumCount}</p>
              <p className="text-xs text-slate-500">Medium Priority</p>
            </div>
          </div>

          {lastRun && (
            <p className="text-xs text-slate-400">Last analyzed: {lastRun.toLocaleTimeString()}</p>
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
