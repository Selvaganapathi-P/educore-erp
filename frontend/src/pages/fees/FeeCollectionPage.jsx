import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, CreditCard, Printer, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const STATUS_COLOR = { pending:'badge-slate', partial:'badge-warning', paid:'badge-success', overdue:'badge-error', waived:'badge-info' };
const MODE_LABEL   = { cash:'Cash', cheque:'Cheque', online:'Online', upi:'UPI', dd:'DD', card:'Card' };

function fmt(n) { return '₹' + Number(n ?? 0).toLocaleString('en-IN'); }

function PaymentModal({ open, onClose, invoice, onPaid }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { amount: invoice?.balanceAmount ?? '', paymentMode: 'cash', paymentDate: dayjs().format('YYYY-MM-DD'), reference: '', remarks: '' },
  });

  const mutation = useMutation({
    mutationFn: (body) => api.post(`/fees/invoices/${invoice._id}/pay`, body).then(r => r.data),
    onSuccess: (data) => {
      toast.success(`Payment recorded — ${data.data.payment.receiptNo}`);
      onPaid(data.data);
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => mutation.mutate({ ...data, amount: Number(data.amount) });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-md">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Record Payment</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          {invoice && (
            <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-mono text-slate-600">{invoice.invoiceNo}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Period</span><span>{invoice.period}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Net Amount</span><span className="font-semibold">{fmt(invoice.netAmount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="text-emerald-600">{fmt(invoice.paidAmount)}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-1 mt-1"><span className="font-semibold">Balance Due</span><span className="font-bold text-red-600">{fmt(invoice.balanceAmount)}</span></div>
              </div>

              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input type="number" {...register('amount',{required:true,min:1,max:invoice.balanceAmount})} className="form-input" step="0.01"/>
                {errors.amount && <p className="form-error">Enter a valid amount (≤ balance)</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Payment Mode *</label>
                <select {...register('paymentMode',{required:true})} className="form-select">
                  {Object.entries(MODE_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Date *</label>
                <input type="date" {...register('paymentDate',{required:true})} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Reference / Transaction ID</label>
                <input {...register('reference')} className="form-input" placeholder="Cheque no. / UTR / —"/>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea {...register('remarks')} className="form-textarea" rows={2}/>
              </div>

              <div className="dialog-footer">
                <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
                <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                  <CreditCard size={14}/> {mutation.isPending ? 'Processing…' : 'Collect Payment'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ReceiptModal({ open, onClose, payment, invoice, student }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Receipt</title><style>body{font-family:sans-serif;padding:24px;color:#111;}table{width:100%;border-collapse:collapse;}td,th{padding:6px 8px;border:1px solid #ccc;font-size:13px;}h2{margin:0 0 4px;}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0;}.meta div{font-size:13px;}.mono{font-family:monospace;}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  if (!payment) return null;

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Payment Receipt</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <div className="dialog-body">
            <div ref={printRef} className="border border-slate-200 rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Fee Receipt</h2>
                  <p className="text-xs text-slate-500">School ERP System</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-slate-700">{payment.receiptNo}</p>
                  <p className="text-xs text-slate-500">{dayjs(payment.paymentDate).format('DD MMM YYYY')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-400">Student</p><p className="font-medium">{student?.name}</p></div>
                <div><p className="text-xs text-slate-400">Roll No.</p><p>{student?.rollNumber}</p></div>
                <div><p className="text-xs text-slate-400">Class</p><p>{invoice?.classId?.name}</p></div>
                <div><p className="text-xs text-slate-400">Period</p><p>{invoice?.period}</p></div>
              </div>

              <table className="w-full text-sm border border-slate-200 rounded">
                <tbody>
                  <tr className="bg-slate-50"><td className="px-3 py-2 text-slate-500">Invoice No.</td><td className="px-3 py-2 font-mono">{invoice?.invoiceNo}</td></tr>
                  <tr><td className="px-3 py-2 text-slate-500">Amount Paid</td><td className="px-3 py-2 font-bold text-emerald-600">{fmt(payment.amount)}</td></tr>
                  <tr className="bg-slate-50"><td className="px-3 py-2 text-slate-500">Payment Mode</td><td className="px-3 py-2">{MODE_LABEL[payment.paymentMode]}</td></tr>
                  {payment.reference && <tr><td className="px-3 py-2 text-slate-500">Reference</td><td className="px-3 py-2">{payment.reference}</td></tr>}
                  <tr className="bg-slate-50"><td className="px-3 py-2 text-slate-500">Balance After</td><td className="px-3 py-2 font-semibold">{fmt(invoice?.balanceAmount)}</td></tr>
                </tbody>
              </table>

              <p className="text-xs text-slate-400 text-center">This is a computer-generated receipt and requires no signature.</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="btn btn-ghost btn-md">Close</button>
              <button onClick={handlePrint} className="btn btn-primary btn-md"><Printer size={14}/> Print</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function FeeCollectionPage() {
  const [search,   setSearch]   = useState('');
  const [student,  setStudent]  = useState(null);
  const [payInv,   setPayInv]   = useState(null);
  const [receipt,  setReceipt]  = useState(null);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['student-search-fee', search],
    queryFn:  () => search.length >= 2
      ? api.get('/students', { params: { search, limit: 10 } }).then(r => r.data.data)
      : [],
    enabled: search.length >= 2,
    staleTime: 30_000,
  });

  const { data: invoiceData, refetch: refetchInvoices } = useQuery({
    queryKey: ['student-invoices', student?._id],
    queryFn:  () => api.get('/fees/invoices', { params: { studentId: student._id } }).then(r => r.data),
    enabled:  !!student,
    staleTime: 0,
  });

  const invoices = invoiceData?.data ?? [];

  const selectStudent = (s) => {
    const name = `${s.userId?.profile?.firstName ?? ''} ${s.userId?.profile?.lastName ?? ''}`.trim();
    setStudent({ ...s, name });
    setSearch('');
  };

  const onPaid = (data) => {
    setReceipt({ payment: data.payment, invoice: data.invoice });
    refetchInvoices();
  };

  const StatusIcon = ({ status }) => {
    if (status === 'paid') return <CheckCircle2 size={14} className="text-emerald-500"/>;
    if (status === 'overdue') return <AlertTriangle size={14} className="text-red-500"/>;
    return <Clock size={14} className="text-amber-500"/>;
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Collection</h1>
          <p className="page-subtitle">Search a student to view invoices and collect payment</p>
        </div>
      </div>

      {/* Student search */}
      <div className="card card-body">
        <label className="form-label">Search Student</label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-9"
            placeholder="Type name, roll number, or admission no…"
          />
          {isFetching && <div className="absolute right-3 top-1/2 -translate-y-1/2 spinner-sm"/>}
        </div>
        {results.length > 0 && (
          <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden shadow-lg divide-y divide-slate-100 bg-white z-20 relative">
            {results.map(s => {
              const name = `${s.userId?.profile?.firstName ?? ''} ${s.userId?.profile?.lastName ?? ''}`.trim();
              return (
                <button key={s._id} onClick={() => selectStudent(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">Roll: {s.rollNumber} · {s.currentClass?.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Student header */}
      {student && (
        <div className="card card-body flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">
            {student.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-lg">{student.name}</p>
            <p className="text-sm text-slate-500">Roll: {student.rollNumber} · {student.currentClass?.name}</p>
          </div>
          <button onClick={() => setStudent(null)} className="btn-icon text-slate-400"><X size={16}/></button>
        </div>
      )}

      {/* Invoices */}
      {student && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <p className="font-semibold text-slate-700">Fee Invoices</p>
          </div>
          {invoices.length === 0
            ? <div className="card-body text-center text-slate-400 py-10">No invoices found for this student.</div>
            : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Period</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Net</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Paid</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Balance</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Due</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                    <th className="px-4 py-3"/>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{inv.invoiceNo}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{inv.period}</td>
                      <td className="px-4 py-3 text-sm text-right">{fmt(inv.netAmount)}</td>
                      <td className="px-4 py-3 text-sm text-right text-emerald-600">{fmt(inv.paidAmount)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-red-600">{fmt(inv.balanceAmount)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{dayjs(inv.dueDate).format('DD MMM YYYY')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`badge text-xs inline-flex items-center gap-1 ${STATUS_COLOR[inv.status] ?? 'badge-slate'}`}>
                          <StatusIcon status={inv.status}/> {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {inv.status !== 'paid' && inv.status !== 'waived' && (
                          <button onClick={() => setPayInv(inv)} className="btn btn-primary btn-xs">
                            <CreditCard size={11}/> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}

      <PaymentModal
        open={!!payInv}
        onClose={() => setPayInv(null)}
        invoice={payInv}
        onPaid={onPaid}
      />

      {receipt && (
        <ReceiptModal
          open={!!receipt}
          onClose={() => setReceipt(null)}
          payment={receipt.payment}
          invoice={receipt.invoice}
          student={student}
        />
      )}
    </div>
  );
}
