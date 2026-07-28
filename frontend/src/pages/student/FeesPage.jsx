import { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Printer } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/axios';

function printReceipt(fee, studentName) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fee Receipt</title>
  <style>body{font-family:Arial,sans-serif;margin:40px;color:#111}
  h1{color:#1e40af;margin-bottom:4px}.divider{border-top:1px solid #e5e7eb;margin:16px 0}
  .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
  .label{color:#6b7280}.value{font-weight:600}
  .total{background:#f1f5f9;padding:12px 16px;border-radius:8px;margin-top:16px}
  .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:13px;font-weight:600;background:#dcfce7;color:#166534}
  @media print{.no-print{display:none}}</style></head>
  <body>
  <h1>EduCore School</h1>
  <p style="color:#6b7280">Official Fee Receipt</p>
  <div class="divider"></div>
  <div class="row"><span class="label">Receipt No</span><span class="value">${fee.receiptNo || 'N/A'}</span></div>
  <div class="row"><span class="label">Student Name</span><span class="value">${studentName}</span></div>
  <div class="row"><span class="label">Fee Type</span><span class="value" style="text-transform:capitalize">${fee.feeType}</span></div>
  <div class="row"><span class="label">Academic Year</span><span class="value">${fee.academicYear}</span></div>
  ${fee.description ? `<div class="row"><span class="label">Description</span><span class="value">${fee.description}</span></div>` : ''}
  <div class="row"><span class="label">Payment Date</span><span class="value">${fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'N/A'}</span></div>
  <div class="row"><span class="label">Payment Mode</span><span class="value" style="text-transform:capitalize">${fee.paymentMode || 'N/A'}</span></div>
  <div class="divider"></div>
  <div class="total">
  <div class="row"><span class="label">Total Amount</span><span class="value">₹${fee.amount?.toLocaleString('en-IN')}</span></div>
  <div class="row"><span class="label">Amount Paid</span><span class="value">₹${fee.paidAmount?.toLocaleString('en-IN')}</span></div>
  <div class="row"><span class="label">Status</span><span class="badge">${fee.status?.toUpperCase()}</span></div>
  </div>
  <p style="margin-top:40px;color:#9ca3af;font-size:12px">This is a computer-generated receipt. Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
  <script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

export default function StudentFeesPage() {
  const { user, student } = useAuthStore();
  const [fees, setFees]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fees').then(r => setFees(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total   = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const paid    = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const pending = total - paid;

  const statusIcon = { paid: CheckCircle, pending: AlertCircle, partial: Clock };
  const statusColor = { paid: 'text-green-500', pending: 'text-red-500', partial: 'text-yellow-500' };
  const statusBg    = { paid: 'bg-green-100 text-green-700', pending: 'bg-red-100 text-red-700', partial: 'bg-yellow-100 text-yellow-700' };

  if (loading) return <p className="text-gray-400">Loading fees...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Fees</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ['Total Fees', `₹${total.toLocaleString('en-IN')}`, 'text-gray-900'],
          ['Paid', `₹${paid.toLocaleString('en-IN')}`, 'text-green-700'],
          ['Pending', `₹${pending.toLocaleString('en-IN')}`, pending > 0 ? 'text-red-600' : 'text-gray-900'],
        ].map(([label, value, cls]) => (
          <div key={label} className="bg-white rounded-xl border p-5">
            <p className={`text-xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {fees.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No fee records found.</div>
      ) : (
        <div className="space-y-3">
          {fees.map(f => {
            const Icon = statusIcon[f.status];
            return (
              <div key={f._id} className="bg-white rounded-xl border p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Icon className={`w-6 h-6 flex-shrink-0 ${statusColor[f.status]}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 capitalize">{f.feeType} Fee</p>
                    <p className="text-xs text-gray-500 truncate">{f.academicYear}{f.description ? ` · ${f.description}` : ''}</p>
                    {f.receiptNo && <p className="text-xs text-gray-400">Receipt: {f.receiptNo}</p>}
                    {f.paymentDate && <p className="text-xs text-gray-400">Paid: {new Date(f.paymentDate).toLocaleDateString('en-IN')}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{f.amount?.toLocaleString('en-IN')}</p>
                    {f.paidAmount > 0 && f.paidAmount < f.amount && (
                      <p className="text-xs text-gray-500">Paid: ₹{f.paidAmount.toLocaleString('en-IN')}</p>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBg[f.status]}`}>{f.status}</span>
                  </div>
                  {f.status === 'paid' && (
                    <button
                      onClick={() => printReceipt(f, user?.name)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download / Print Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pending > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">Outstanding Balance: ₹{pending.toLocaleString('en-IN')}</p>
          <p className="text-xs">Please contact the school office to clear your pending dues.</p>
        </div>
      )}
    </div>
  );
}
