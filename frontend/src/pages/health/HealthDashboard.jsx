import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Calendar, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const BG_COLORS = {
  'A+':'bg-red-100 text-red-700', 'A-':'bg-red-50 text-red-600',
  'B+':'bg-blue-100 text-blue-700', 'B-':'bg-blue-50 text-blue-600',
  'AB+':'bg-purple-100 text-purple-700', 'AB-':'bg-purple-50 text-purple-600',
  'O+':'bg-emerald-100 text-emerald-700', 'O-':'bg-emerald-50 text-emerald-600',
  unknown:'bg-slate-100 text-slate-500',
};

export default function HealthDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['health-dashboard'],
    queryFn:  () => api.get('/health/dashboard').then(r => r.data.data),
    staleTime: 60_000,
  });

  const kpis = [
    { label: 'Total Visits',  value: data?.totalVisits ?? 0,  sub: 'all time',         icon: Activity, color: 'bg-primary-50 text-primary-600'  },
    { label: 'Today',         value: data?.todayVisits ?? 0,  sub: 'visits today',     icon: Heart,    color: 'bg-rose-50 text-rose-600'         },
    { label: 'This Week',     value: data?.weekVisits  ?? 0,  sub: 'last 7 days',      icon: Calendar, color: 'bg-amber-50 text-amber-600'       },
    { label: 'Follow-ups',    value: data?.followUps?.length ?? 0, sub: 'upcoming',    icon: Clock,    color: 'bg-teal-50 text-teal-600'         },
  ];

  const memberName = (m) => {
    const p = m?.userId?.profile || m?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : m?.rollNumber || m?.employeeId || '—';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Health Centre</h1>
          <p className="page-subtitle">Student & staff health records and medical visits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/health/records')} className="btn btn-ghost btn-md">Health Records</button>
          <button onClick={() => navigate('/health/visits')} className="btn btn-primary btn-md">
            <Heart size={15}/> Log Visit
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="card card-body">
            {isLoading
              ? <div className="skeleton h-16 rounded-lg"/>
              : (
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
                    <k.icon size={18}/>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{k.value}</p>
                    <p className="text-xs text-slate-500">{k.label}</p>
                    <p className="text-xs text-slate-400">{k.sub}</p>
                  </div>
                </div>
              )
            }
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent visits */}
        <div className="card lg:col-span-2">
          <div className="card-body border-b border-slate-100 flex items-center justify-between py-3">
            <p className="font-semibold text-sm text-slate-700">Recent Visits</p>
            <button onClick={() => navigate('/health/visits')} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
              All visits <ArrowRight size={11}/>
            </button>
          </div>
          {isLoading
            ? <div className="card-body space-y-2">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-14 rounded"/>)}</div>
            : !data?.recentVisits?.length
              ? <div className="card-body text-center py-10 text-slate-400 text-sm">No visits recorded yet.</div>
              : (
                <div className="divide-y divide-slate-100">
                  {data.recentVisits.map(v => (
                    <div key={v._id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {memberName(v.memberId)[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{memberName(v.memberId)}</p>
                        <p className="text-xs text-slate-400 truncate">{v.complaint}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">{dayjs(v.visitDate).format('DD MMM')}</p>
                        <span className={`text-xs badge ${v.memberModel === 'Student' ? 'badge-primary' : 'badge-warning'}`}>{v.memberModel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
          }
        </div>

        <div className="space-y-4">
          {/* Blood group stats */}
          <div className="card card-body space-y-3">
            <p className="font-semibold text-sm text-slate-700">Blood Groups</p>
            {isLoading
              ? Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-7 rounded"/>)
              : !data?.bloodGroups?.length
                ? <p className="text-xs text-slate-400">No records yet</p>
                : (
                  <div className="flex flex-wrap gap-2">
                    {data.bloodGroups.map(bg => (
                      <div key={bg._id} className={`rounded-lg px-3 py-1.5 text-center min-w-14 ${BG_COLORS[bg._id] ?? BG_COLORS.unknown}`}>
                        <p className="text-base font-bold">{bg.count}</p>
                        <p className="text-xs font-medium">{bg._id}</p>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>

          {/* Upcoming follow-ups */}
          <div className="card card-body space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500"/>
              <p className="font-semibold text-sm text-slate-700">Upcoming Follow-ups</p>
            </div>
            {isLoading
              ? Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-10 rounded"/>)
              : !data?.followUps?.length
                ? <p className="text-xs text-slate-400">No upcoming follow-ups</p>
                : data.followUps.map(v => (
                  <div key={v._id} className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{memberName(v.memberId)}</p>
                      <p className="text-xs text-slate-400 truncate">{v.complaint}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 shrink-0">{dayjs(v.followUpDate).format('DD MMM')}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Health Records', sub: 'View & update member profiles', href: '/health/records', color: 'border-primary-200 hover:bg-primary-50' },
          { label: 'Medical Visits', sub: 'Log complaints, prescriptions',  href: '/health/visits',  color: 'border-slate-200 hover:bg-slate-50'    },
        ].map(a => (
          <button key={a.href} onClick={() => navigate(a.href)}
            className={`card card-body flex items-center justify-between text-left border-2 transition-colors ${a.color}`}>
            <div>
              <p className="font-semibold text-slate-800">{a.label}</p>
              <p className="text-xs text-slate-500">{a.sub}</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 shrink-0"/>
          </button>
        ))}
      </div>
    </div>
  );
}
