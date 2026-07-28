import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function StudentFeesPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fees').then(r => setFees(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total    = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const paid     = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const pending  = total - paid;

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
              <div key={f._id} className="bg-white rounded-xl border p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Icon className={`w-6 h-6 flex-shrink-0 ${statusColor[f.status]}`} />
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{f.feeType} Fee</p>
                    <p className="text-xs text-gray-500">{f.academicYear} {f.description ? `· ${f.description}` : ''}</p>
                    {f.receiptNo && <p className="text-xs text-gray-400">Receipt: {f.receiptNo}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{f.amount?.toLocaleString('en-IN')}</p>
                  {f.paidAmount > 0 && f.paidAmount < f.amount && (
                    <p className="text-xs text-gray-500">Paid: ₹{f.paidAmount.toLocaleString('en-IN')}</p>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusBg[f.status]}`}>{f.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
