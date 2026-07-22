import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bus, Route, Users, AlertTriangle, ArrowRight, CheckCircle2, Wrench } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

export default function TransportDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['transport-dashboard'],
    queryFn:  () => api.get('/transport/dashboard').then(r => r.data.data),
    staleTime: 60_000,
  });

  const kpis = [
    { label: 'Total Vehicles',     value: data?.totalVehicles     ?? 0, sub: `${data?.activeVehicles ?? 0} active`,     icon: Bus,          color: 'bg-primary-50 text-primary-600'   },
    { label: 'Routes',             value: data?.totalRoutes        ?? 0, sub: 'active routes',                           icon: Route,        color: 'bg-emerald-50 text-emerald-600'   },
    { label: 'Students Enrolled',  value: data?.enrolledStudents   ?? 0, sub: 'using transport',                         icon: Users,        color: 'bg-amber-50 text-amber-600'       },
    { label: 'In Maintenance',     value: data?.maintenanceCount   ?? 0, sub: 'vehicles offline',                        icon: Wrench,       color: 'bg-red-50 text-red-600'           },
  ];

  const expiringDocs = data?.expiringDocs ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transport Management</h1>
          <p className="page-subtitle">Fleet, routes, and student transport assignments</p>
        </div>
        <button onClick={() => navigate('/transport/vehicles')} className="btn btn-primary btn-md">
          <Bus size={15}/> Manage Fleet
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Vehicle Fleet',    sub: 'Add / manage vehicles',   href: '/transport/vehicles', color: 'border-primary-200 hover:bg-primary-50' },
          { label: 'Routes',           sub: 'Plan routes & stops',      href: '/transport/routes',   color: 'border-emerald-200 hover:bg-emerald-50' },
          { label: 'Student Assign',   sub: 'Assign students to routes',href: '/transport/students', color: 'border-amber-200 hover:bg-amber-50'     },
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

      {/* Document expiry alerts */}
      {expiringDocs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500"/>
            <p className="font-semibold text-slate-700">Documents Expiring Soon (30 days)</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Vehicle</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Insurance</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">PUC</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Fitness</th>
              </tr>
            </thead>
            <tbody>
              {expiringDocs.map(v => {
                const expired = (d) => d && dayjs(d).isBefore(dayjs());
                const warn    = (d) => d && dayjs(d).isBefore(dayjs().add(30,'day')) && !expired(d);
                const fmtDate = (d) => d ? dayjs(d).format('DD MMM YY') : '—';
                const cls = (d) => expired(d) ? 'text-red-600 font-semibold' : warn(d) ? 'text-amber-600 font-medium' : 'text-slate-500';

                return (
                  <tr key={v._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{v.registrationNo}</td>
                    <td className={`px-4 py-2.5 text-sm ${cls(v.insuranceExpiry)}`}>{fmtDate(v.insuranceExpiry)}</td>
                    <td className={`px-4 py-2.5 text-sm ${cls(v.pucExpiry)}`}>{fmtDate(v.pucExpiry)}</td>
                    <td className={`px-4 py-2.5 text-sm ${cls(v.fitnessExpiry)}`}>{fmtDate(v.fitnessExpiry)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
