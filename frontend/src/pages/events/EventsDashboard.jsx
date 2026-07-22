import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Award, Star, Clock, ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const TYPE_CFG = {
  academic:  { color: 'bg-primary-100 text-primary-700',  dot: 'bg-primary-500'  },
  sports:    { color: 'bg-emerald-100 text-emerald-700',  dot: 'bg-emerald-500'  },
  cultural:  { color: 'bg-pink-100 text-pink-700',        dot: 'bg-pink-500'     },
  holiday:   { color: 'bg-amber-100 text-amber-700',      dot: 'bg-amber-500'    },
  meeting:   { color: 'bg-slate-100 text-slate-600',      dot: 'bg-slate-400'    },
  exam:      { color: 'bg-red-100 text-red-700',          dot: 'bg-red-500'      },
  workshop:  { color: 'bg-teal-100 text-teal-700',        dot: 'bg-teal-500'     },
  trip:      { color: 'bg-purple-100 text-purple-700',    dot: 'bg-purple-500'   },
  other:     { color: 'bg-slate-100 text-slate-600',      dot: 'bg-slate-400'    },
};

const CERT_COLORS = ['bg-primary-100 text-primary-700','bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700','bg-pink-100 text-pink-700','bg-purple-100 text-purple-700','bg-teal-100 text-teal-700'];

export default function EventsDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['events-dashboard'],
    queryFn:  () => api.get('/events/dashboard').then(r => r.data.data),
    staleTime: 60_000,
  });

  const kpis = [
    { label: 'Total Events',  value: data?.total      ?? 0, sub: 'all time',       icon: Calendar, color: 'bg-primary-50 text-primary-600' },
    { label: 'Upcoming',      value: data?.upcoming   ?? 0, sub: 'scheduled ahead', icon: Clock,    color: 'bg-amber-50 text-amber-600'    },
    { label: 'This Week',     value: data?.thisWeek   ?? 0, sub: 'in next 7 days',  icon: Star,     color: 'bg-emerald-50 text-emerald-600'},
    { label: 'Published',     value: data?.published  ?? 0, sub: 'visible to all',  icon: Award,    color: 'bg-rose-50 text-rose-600'      },
  ];

  const recipientName = (r) => {
    const p = r?.userId?.profile || r?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : r?.rollNumber || r?.employeeId || '—';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events & Certificates</h1>
          <p className="page-subtitle">School calendar, event management, and certificate issuance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/events/certificates')} className="btn btn-ghost btn-md">Certificates</button>
          <button onClick={() => navigate('/events/list')} className="btn btn-primary btn-md">
            <Calendar size={15}/> Manage Events
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
        {/* Upcoming events */}
        <div className="card lg:col-span-2">
          <div className="card-body border-b border-slate-100 flex items-center justify-between py-3">
            <p className="font-semibold text-sm text-slate-700">Upcoming Events</p>
            <button onClick={() => navigate('/events/list')} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
              All events <ArrowRight size={11}/>
            </button>
          </div>
          {isLoading
            ? <div className="card-body space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-16 rounded"/>)}</div>
            : !data?.upcomingEvents?.length
              ? <div className="card-body text-center py-10 text-slate-400 text-sm">No upcoming events.</div>
              : (
                <div className="divide-y divide-slate-100">
                  {data.upcomingEvents.map(ev => {
                    const cfg = TYPE_CFG[ev.type] ?? TYPE_CFG.other;
                    const daysLeft = dayjs(ev.startDate).diff(dayjs(), 'day');
                    return (
                      <div key={ev._id} className="flex items-center gap-3 px-4 py-3">
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${cfg.color}`}>
                          <span className="text-xs font-bold leading-none">{dayjs(ev.startDate).format('DD')}</span>
                          <span className="text-2xs leading-none uppercase">{dayjs(ev.startDate).format('MMM')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{ev.title}</p>
                          <p className="text-xs text-slate-400">{ev.venue || 'No venue'} · <span className="capitalize">{ev.type}</span></p>
                        </div>
                        <div className="text-right shrink-0">
                          {daysLeft === 0
                            ? <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Today</span>
                            : daysLeft === 1
                              ? <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Tomorrow</span>
                              : <span className="text-xs text-slate-500">in {daysLeft}d</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          }
        </div>

        <div className="space-y-4">
          {/* Cert breakdown */}
          <div className="card card-body space-y-3">
            <p className="font-semibold text-sm text-slate-700">Certificates Issued</p>
            {isLoading
              ? Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-7 rounded"/>)
              : !data?.certByType?.length
                ? <p className="text-xs text-slate-400">No certificates yet</p>
                : data.certByType.map((c, i) => (
                  <div key={c._id} className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CERT_COLORS[i % CERT_COLORS.length]}`}>{c._id}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-400 rounded-full" style={{ width: `${Math.round((c.count / (data.certByType.reduce((s,x) => s+x.count, 0)||1)) * 100)}%` }}/>
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-6 text-right">{c.count}</span>
                  </div>
                ))
            }
            <button onClick={() => navigate('/events/certificates')} className="flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1">
              Issue certificate <ArrowRight size={11}/>
            </button>
          </div>

          {/* Recent certs */}
          <div className="card card-body space-y-2">
            <p className="font-semibold text-sm text-slate-700">Recent Certificates</p>
            {isLoading
              ? Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-10 rounded"/>)
              : !data?.recentCerts?.length
                ? <p className="text-xs text-slate-400">None issued yet</p>
                : data.recentCerts.map(c => (
                  <div key={c._id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-2">
                    <Award size={13} className="text-amber-500 shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate capitalize">{c.type} — {recipientName(c.recipientId)}</p>
                      <p className="text-2xs text-slate-400">{c.certNumber}</p>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Event Calendar',  sub: 'Create and manage school events', href: '/events/list',         color: 'border-primary-200 hover:bg-primary-50' },
          { label: 'Certificates',    sub: 'Issue bonafide, character & more', href: '/events/certificates', color: 'border-amber-200 hover:bg-amber-50'    },
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
