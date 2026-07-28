import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Trash2, Plus, CreditCard } from 'lucide-react';

const FEE_TYPES = ['admission', 'tuition', 'exam', 'other'];

export default function FeesPage() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showPay, setShowPay] = useState(null);
  const [filter, setFilter] = useState({ status: '', feeType: '', academicYear: '' });
  const [form, setForm] = useState({ studentId: '', feeType: '', description: '', amount: '', dueDate: '', academicYear: '' });
  const [payAmount, setPayAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => { if (v) p.set(k, v); });
    api.get(`/fees?${p}`).then(r => setFees(r.data.data)).catch(() => toast.error('Load failed')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);
  useEffect(() => { api.get('/students?limit=200').then(r => setStudents(r.data.data)).catch(() => {}); }, []);

  const addFee = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.feeType || !form.amount || !form.academicYear) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      await api.post('/fees', { ...form, amount: Number(form.amount) });
      toast.success('Fee added');
      setShowAdd(false);
      setForm({ studentId: '', feeType: '', description: '', amount: '', dueDate: '', academicYear: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async () => {
    if (!payAmount) { toast.error('Enter amount'); return; }
    setSaving(true);
    try {
      await api.put(`/fees/${showPay}/pay`, { amount: Number(payAmount), paymentMode: 'cash' });
      toast.success('Payment recorded');
      setShowPay(null);
      setPayAmount('');
      load();
    } catch {
      toast.error('Payment failed');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this fee record?')) return;
    try {
      await api.delete(`/fees/${id}`);
      toast.success('Deleted');
      setFees(f => f.filter(x => x._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const statusColor = { paid: 'bg-green-100 text-green-700', pending: 'bg-red-100 text-red-700', partial: 'bg-yellow-100 text-yellow-700' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
        <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Fee
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addFee} className="bg-white rounded-xl border p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Add Fee Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Student *</label>
              <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.admissionNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fee Type *</label>
              <select value={form.feeType} onChange={e => setForm(f => ({ ...f, feeType: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select type</option>
                {FEE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Amount" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Academic Year *</label>
              <input value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2024-25" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60">
              {saving ? 'Saving...' : 'Add Fee'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2 border text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {/* Pay modal */}
      {showPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-80">
            <h3 className="font-semibold text-gray-900 mb-4">Record Payment</h3>
            <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" placeholder="Amount paid (₹)" />
            <div className="flex gap-3">
              <button onClick={markPaid} disabled={saving} className="flex-1 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60">
                {saving ? 'Saving...' : 'Record'}
              </button>
              <button onClick={() => { setShowPay(null); setPayAmount(''); }} className="flex-1 py-2 border text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-5 flex flex-wrap gap-3">
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
        </select>
        <select value={filter.feeType} onChange={e => setFilter(f => ({ ...f, feeType: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          {FEE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <input value={filter.academicYear} onChange={e => setFilter(f => ({ ...f, academicYear: e.target.value }))}
          placeholder="Academic Year" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36" />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Student', 'Type', 'Amount', 'Paid', 'Status', 'Receipt', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No fee records found</td></tr>
              ) : fees.map(f => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{f.studentId?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{f.feeType}</td>
                  <td className="px-4 py-3">₹{f.amount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">₹{(f.paidAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[f.status]}`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{f.receiptNo || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {f.status !== 'paid' && (
                        <button onClick={() => setShowPay(f._id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Mark paid">
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => del(f._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
