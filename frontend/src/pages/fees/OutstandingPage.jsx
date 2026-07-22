import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, Filter } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const STATUS_COLOR = {
  pending: 'badge-slate',
  partial:  'badge-warning',
  overdue:  'badge-error',
};

function fmt(n) { return '₹' + Number(n ?? 0).toLocaleString('en-IN'); }

export default function OutstandingPage() {
  const navigate = useNavigate();
  const [classId, setClassId] = useState('');

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn:  () => api.get('/academics/classes').then(r => r.data.data),
    staleTime: 300_000,
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['outstanding-invoices', classId],
    queryFn:  () => api.get('/fees/outstanding', { params: classId ? { classId } : {} }).then(r => r.data.data),
    staleTime: 30_000,
  });

  const totalOutstanding = invoices.reduce((s, inv) => s + (inv.balanceAmount ?? 0), 0);
  const overdueCount     = invoices.filter(inv => inv.status === 'overdue').length;

  const exportCSV = () => {
    const rows = [
      ['Invoice No', 'Student', 'Roll No', 'Class', 'Period', 'Net Amount', 'Paid', 'Balance', 'Due Date', 'Status'],
      ...invoices.map(inv => [
        inv.invoiceNo,
        `${inv.userId?.profile?.firstName ?? ''} ${inv.userId?.profile?.lastName ?? ''}`.trim(),
        inv.studentId?.rollNumber ?? '',
        inv.classId?.name ?? '',
        inv.period ?? '',
        inv.netAmount,
        inv.paidAmount,
        inv.balanceAmount,
        dayjs(inv.dueDate).format('DD-MM-YYYY'),
        inv.status,
      ]),
    ];
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `outstanding_${dayjs().format('YYYYMMDD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Outstanding Dues</h1>
          <p className="page-subtitle">Pending, partial, and overdue fee invoices</p>
        </div>
        <button onClick={exportCSV} className="btn btn-ghost btn-md">
          <Download size={14}/> Export CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card card-body">
          <p className="text-2xl font-bold text-red-600">{fmt(totalOutstanding)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Outstanding</p>
        </div>
        <div className="card card-body">
          <p className="text-2xl font-bold text-slate-800">{invoices.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Open Invoices</p>
        </div>
        <div className="card card-body">
          <p className="text-2xl font-bold text-amber-600">{overdueCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter size={14} className="text-slate-400"/>
        <select value={classId} onChange={e => setClassId(e.target.value)} className="form-select w-48 text-sm py-1.5">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:8}).map((_,i)=><div key={i} className="skeleton h-10 rounded-lg"/>)}</div>
          : invoices.length === 0
            ? (
              <div className="card-body text-center py-16 text-slate-400">
                <AlertTriangle size={32} className="mx-auto mb-3 text-slate-300"/>
                <p className="font-medium">No outstanding dues</p>
                {classId && <p className="text-sm">Try removing the class filter.</p>}
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Invoice</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Class</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Period</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Balance</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Due Date</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                      <th className="px-4 py-3"/>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => {
                      const isOverdue = inv.status === 'overdue';
                      const name = `${inv.userId?.profile?.firstName ?? ''} ${inv.userId?.profile?.lastName ?? ''}`.trim();
                      return (
                        <tr key={inv._id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${isOverdue ? 'bg-red-50/40' : ''}`}>
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{inv.invoiceNo}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-700">{name}</p>
                            <p className="text-xs text-slate-400">Roll: {inv.studentId?.rollNumber}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{inv.classId?.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell">{inv.period}</td>
                          <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">{fmt(inv.balanceAmount)}</td>
                          <td className={`px-4 py-3 text-xs hidden sm:table-cell ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                            {dayjs(inv.dueDate).format('DD MMM YYYY')}
                            {isOverdue && ` (${dayjs().diff(dayjs(inv.dueDate), 'day')}d late)`}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`badge text-xs ${STATUS_COLOR[inv.status] ?? 'badge-slate'}`}>{inv.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => navigate('/fees/collect')}
                              className="btn btn-ghost btn-xs text-primary-600 hover:bg-primary-50">
                              Collect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-slate-600">Total ({invoices.length} invoices)</td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">{fmt(totalOutstanding)}</td>
                      <td colSpan={3}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
        }
      </div>
    </div>
  );
}
