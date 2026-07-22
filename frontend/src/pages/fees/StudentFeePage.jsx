import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, AlertTriangle, Receipt, Printer } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,          color: 'text-slate-500',  bg: 'bg-slate-50',  badge: 'badge-slate'   },
  partial:  { label: 'Partial',  icon: Clock,          color: 'text-amber-600',  bg: 'bg-amber-50',  badge: 'badge-warning' },
  paid:     { label: 'Paid',     icon: CheckCircle2,   color: 'text-emerald-600',bg: 'bg-emerald-50',badge: 'badge-success' },
  overdue:  { label: 'Overdue',  icon: AlertTriangle,  color: 'text-red-600',    bg: 'bg-red-50',    badge: 'badge-error'   },
  waived:   { label: 'Waived',   icon: CheckCircle2,   color: 'text-blue-600',   bg: 'bg-blue-50',   badge: 'badge-info'    },
};

const MODE_LABEL = { cash:'Cash', cheque:'Cheque', online:'Online', upi:'UPI', dd:'DD', card:'Card' };

function fmt(n) { return '₹' + Number(n ?? 0).toLocaleString('en-IN'); }

function InvoiceDetailModal({ open, onClose, invoiceId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['invoice-detail', invoiceId],
    queryFn:  () => api.get(`/fees/invoices/${invoiceId}`).then(r => r.data.data),
    enabled:  !!invoiceId,
    staleTime: 0,
  });

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-area')?.innerHTML;
    if (!printContent) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:24px;color:#111;}table{width:100%;border-collapse:collapse;}td,th{padding:6px 10px;border:1px solid #ddd;font-size:13px;}th{background:#f8fafc;text-align:left;}</style></head><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
  };

  const inv = data;

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Invoice Detail</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <div className="dialog-body">
            {isLoading
              ? <div className="space-y-2">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-8 rounded"/>)}</div>
              : inv && (
                <div id="invoice-print-area" className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-sm font-bold text-slate-700">{inv.invoiceNo}</p>
                      <p className="text-xs text-slate-400">Period: {inv.period}</p>
                    </div>
                    <span className={`badge ${STATUS_CONFIG[inv.status]?.badge ?? 'badge-slate'}`}>{STATUS_CONFIG[inv.status]?.label ?? inv.status}</span>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Fee Head</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Amount</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Concession</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inv.items ?? []).map((item, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-3 py-2">{item.head}</td>
                          <td className="px-3 py-2 text-right">{fmt(item.amount)}</td>
                          <td className="px-3 py-2 text-right text-emerald-600">{item.concession > 0 ? `-${fmt(item.concession)}` : '—'}</td>
                          <td className="px-3 py-2 text-right font-medium">{fmt(item.finalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 bg-slate-50">
                        <td className="px-3 py-2 font-semibold" colSpan={3}>Net Amount</td>
                        <td className="px-3 py-2 font-bold text-right">{fmt(inv.netAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Payments */}
                  {(inv.payments ?? []).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Payment History</p>
                      <div className="space-y-1.5">
                        {inv.payments.map(p => (
                          <div key={p._id} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2 text-sm">
                            <div>
                              <p className="font-mono text-xs text-slate-500">{p.receiptNo}</p>
                              <p className="text-xs text-slate-400">{dayjs(p.paymentDate).format('DD MMM YYYY')} · {MODE_LABEL[p.paymentMode]}</p>
                            </div>
                            <p className="font-bold text-emerald-600">{fmt(p.amount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-lg p-3 text-sm">
                    <div><p className="text-xs text-slate-400">Total Paid</p><p className="font-semibold text-emerald-600">{fmt(inv.paidAmount)}</p></div>
                    <div><p className="text-xs text-slate-400">Balance</p><p className={`font-bold ${inv.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmt(inv.balanceAmount)}</p></div>
                    <div><p className="text-xs text-slate-400">Due Date</p><p className="font-medium">{dayjs(inv.dueDate).format('DD MMM YYYY')}</p></div>
                  </div>
                </div>
              )
            }
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="btn btn-ghost btn-md">Close</button>
              <button onClick={handlePrint} className="btn btn-ghost btn-md"><Printer size={14}/> Print</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function StudentFeePage() {
  const user = useAuthStore(s => s.user);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [statusFilter,  setStatusFilter]  = useState('');

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['my-invoices', user?._id, statusFilter],
    queryFn:  () => api.get('/fees/invoices', { params: { status: statusFilter || undefined } }).then(r => r.data),
    staleTime: 60_000,
  });

  const invoices = invoiceData?.data ?? [];
  const totalDue  = invoices.filter(i => i.status !== 'paid' && i.status !== 'waived').reduce((s,i) => s + i.balanceAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s,i) => s + i.paidAmount, 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Fees</h1>
          <p className="page-subtitle">Your fee invoices and payment history</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card card-body">
          <p className="text-xl font-bold text-red-600">{fmt(totalDue)}</p>
          <p className="text-xs text-slate-500">Total Due</p>
        </div>
        <div className="card card-body">
          <p className="text-xl font-bold text-emerald-600">{fmt(totalPaid)}</p>
          <p className="text-xs text-slate-500">Total Paid</p>
        </div>
        <div className="card card-body sm:block hidden">
          <p className="text-xl font-bold text-slate-800">{invoices.length}</p>
          <p className="text-xs text-slate-500">Total Invoices</p>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {[['','All'],['pending','Pending'],['partial','Partial'],['paid','Paid'],['overdue','Overdue']].map(([v,l]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${statusFilter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Invoice cards */}
      {isLoading
        ? <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div>
        : invoices.length === 0
          ? (
            <div className="card card-body text-center py-14 text-slate-400">
              <Receipt size={32} className="mx-auto mb-2 text-slate-300"/>
              <p>No invoices found.</p>
            </div>
          )
          : (
            <div className="space-y-3">
              {invoices.map(inv => {
                const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                const isOverdue = inv.status === 'overdue';
                return (
                  <div key={inv._id} className={`card card-body flex items-center gap-4 ${isOverdue ? 'border border-red-200' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Icon size={18} className={cfg.color}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800">{inv.period}</p>
                        <span className={`badge text-xs ${cfg.badge}`}>{cfg.label}</span>
                        {isOverdue && (
                          <span className="text-xs text-red-500">{dayjs().diff(dayjs(inv.dueDate), 'day')}d overdue</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{inv.invoiceNo} · Due {dayjs(inv.dueDate).format('DD MMM YYYY')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {inv.status === 'paid'
                        ? <p className="font-bold text-emerald-600">{fmt(inv.paidAmount)} paid</p>
                        : (
                          <>
                            <p className="font-bold text-red-600">{fmt(inv.balanceAmount)}</p>
                            <p className="text-xs text-slate-400">of {fmt(inv.netAmount)}</p>
                          </>
                        )
                      }
                    </div>
                    <button onClick={() => setActiveInvoice(inv._id)}
                      className="btn btn-ghost btn-sm shrink-0">
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )
      }

      <InvoiceDetailModal
        open={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        invoiceId={activeInvoice}
      />
    </div>
  );
}
