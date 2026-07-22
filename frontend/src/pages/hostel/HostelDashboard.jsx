import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, BedDouble, Users, ArrowRight, DoorOpen } from 'lucide-react';
import api from '../../lib/axios';

export default function HostelDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['hostel-dashboard'],
    queryFn:  () => api.get('/hostel/dashboard').then(r => r.data.data),
    staleTime: 60_000,
  });

  const occupancyPct = data?.occupancyPct ?? 0;
  const barColor = occupancyPct >= 90 ? 'bg-red-500' : occupancyPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

  const kpis = [
    { label: 'Hostels',     value: data?.totalHostels    ?? 0, sub: 'buildings',      icon: Home,      color: 'bg-primary-50 text-primary-600'  },
    { label: 'Total Beds',  value: data?.totalBeds       ?? 0, sub: 'across all rooms',icon: BedDouble, color: 'bg-slate-50 text-slate-600'      },
    { label: 'Occupied',    value: data?.occupiedBeds    ?? 0, sub: 'beds in use',     icon: Users,     color: 'bg-amber-50 text-amber-600'      },
    { label: 'Available',   value: data?.availableBeds   ?? 0, sub: 'beds free',       icon: DoorOpen,  color: 'bg-emerald-50 text-emerald-600'  },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hostel Management</h1>
          <p className="page-subtitle">Residential facilities, rooms, and student allotments</p>
        </div>
        <button onClick={() => navigate('/hostel/allotments')} className="btn btn-primary btn-md">
          <Users size={15}/> Manage Allotments
        </button>
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

      {/* Occupancy bar */}
      {!isLoading && data?.totalBeds > 0 && (
        <div className="card card-body space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Overall Occupancy</span>
            <span className="font-bold text-slate-800">{occupancyPct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${occupancyPct}%` }}/>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{data.occupiedBeds} occupied</span>
            <span>{data.availableBeds} available of {data.totalBeds}</span>
          </div>
        </div>
      )}

      {/* Hostel type breakdown */}
      {data?.byType && Object.keys(data.byType).length > 0 && (
        <div className="card card-body">
          <p className="text-sm font-semibold text-slate-700 mb-3">By Type</p>
          <div className="flex flex-wrap gap-4">
            {[['boys','Boys','bg-blue-100 text-blue-700'],['girls','Girls','bg-pink-100 text-pink-700'],['co_ed','Co-Ed','bg-purple-100 text-purple-700']].map(([key,label,color]) =>
              data.byType[key] != null && (
                <div key={key} className={`rounded-xl px-4 py-2 text-center ${color}`}>
                  <p className="text-xl font-bold">{data.byType[key]}</p>
                  <p className="text-xs font-medium">{label}</p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Hostels',     sub: 'Manage buildings',      href: '/hostel/hostels',    color: 'border-primary-200 hover:bg-primary-50' },
          { label: 'Rooms',       sub: 'Room occupancy & setup', href: '/hostel/rooms',      color: 'border-slate-200 hover:bg-slate-50'     },
          { label: 'Allotments',  sub: 'Assign / vacate beds',   href: '/hostel/allotments', color: 'border-emerald-200 hover:bg-emerald-50' },
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
