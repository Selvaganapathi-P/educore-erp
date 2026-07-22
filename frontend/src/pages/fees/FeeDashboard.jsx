import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DollarSign, AlertCircle, Users, Receipt, ArrowRight, TrendingUp } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const MODE_LABEL = { cash:'Cash', cheque:'Cheque', online:'Online', upi:'UPI', dd:'DD', card:'Card' };
const MODE_COLOR = { cash:'badge-success', cheque:'badge-slate', online:'badge-primary', upi:'badge-info', dd:'badge-warning', card:'badge-primary' };

function fmt(n) { return '₹' + Number(n ?? 0).toLocaleString('en-IN'); }

export default function FeeDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['fees-dashboard'],
    queryFn:  () => api.get('/fees/dashboard').then(r => r.data.data),
    staleTime: 60_000,
  });

  const kpis = [
    { label: 'Total Collected',  value: fmt(data?.totalCollected),  sub: `${data?.paymentCount ?? 0} transactions`,    icon: DollarSign,  color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Outstanding',      value: fmt(data?.totalOutstanding), sub: `${data?.outstandingCount ?? 0} invoices`,    icon: TrendingUp,  color: 'bg-amber-50 text-amber-600' },
    { label: 'Defaulters',       value: data?.defaulterCount ?? 0,   sub: 'Overdue invoices',                          icon: AlertCircle, color: 'bg-red-50 text-red-600' },
    { label: 'Invoices Pending', value: data?.invoicesByStatus?.pending ?? 0, sub: 'Awaiting payment',                 icon: Receipt,     color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-subtitle">Financial overview, collection, and outstanding dues</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/fees/collect')} className="btn btn-primary btn-md">
            <Receipt size={15}/> Collect Fee
          </button>
        </div>
      </div>

      {/* KPI cards */}
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
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-slate-800 truncate">{k.value}</p>
                    <p className="text-xs text-slate-500">{k.label}</p>
                    <p className="text-xs text-slate-400">{k.sub}</p>
                  </div>
                </div>
              )
            }
          </div>
        ))}
      </div>

      {/* Invoice status breakdown */}
      {data?.invoicesByStatus && (
        <div className="card card-body">
          <p className="text-sm font-semibold text-slate-700 mb-3">Invoice Status Breakdown</p>
          <div className="flex flex-wrap gap-4">
            {[['pending','Pending','bg-slate-200'],['partial','Partial','bg-amber-400'],['paid','Paid','bg-emerald-400'],['overdue','Overdue','bg-red-400'],['waived','Waived','bg-blue-300']].map(([key, label, color]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`}/>
                <span className="text-sm text-slate-600">{label}</span>
                <span className="font-bold text-slate-800">{data.invoicesByStatus[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Collect Fee',      sub: 'Record a payment',    href: '/fees/collect',    color: 'border-emerald-200 hover:bg-emerald-50' },
          { label: 'Fee Structures',   sub: 'Manage fee heads',    href: '/fees/structures', color: 'border-blue-200 hover:bg-blue-50' },
          { label: 'Outstanding Dues', sub: 'View pending invoices',href: '/fees/outstanding',color: 'border-amber-200 hover:bg-amber-50' },
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

      {/* Recent payments */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <p className="font-semibold text-slate-700">Recent Payments</p>
          <button onClick={() => navigate('/fees/outstanding')} className="text-xs text-primary-600 hover:text-primary-700">View all</button>
        </div>
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-10 rounded-lg"/>)}</div>
          : (data?.recentPayments ?? []).length === 0
            ? <div className="card-body text-center text-slate-400 py-10">No payments yet.</div>
            : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Receipt</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Period</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Amount</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Mode</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentPayments ?? []).map(p => (
                    <tr key={p._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.receiptNo}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {p.userId?.profile?.firstName} {p.userId?.profile?.lastName}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">{p.invoiceId?.period}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">{fmt(p.amount)}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`badge text-xs ${MODE_COLOR[p.paymentMode] ?? 'badge-slate'}`}>{MODE_LABEL[p.paymentMode]}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 text-right hidden md:table-cell">
                        {dayjs(p.paymentDate).format('DD MMM')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
      </div>
    </div>
  );
}
