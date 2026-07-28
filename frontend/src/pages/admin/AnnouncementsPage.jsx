import { useEffect, useState } from 'react';
import { Bell, Plus, Trash2, Star } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['general', 'exam', 'event', 'holiday', 'result'];
const CAT_COLORS = {
  general: 'bg-gray-100 text-gray-700',
  exam:    'bg-blue-100 text-blue-700',
  event:   'bg-purple-100 text-purple-700',
  holiday: 'bg-green-100 text-green-700',
  result:  'bg-orange-100 text-orange-700',
};

export default function AnnouncementsPage() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', important: false });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/announcements?limit=50').then(r => setList(r.data.data)).catch(() => toast.error('Load failed')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Title and content required'); return; }
    setSaving(true);
    try {
      await api.post('/announcements', form);
      toast.success('Announcement posted');
      setForm({ title: '', content: '', category: 'general', important: false });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Deleted');
      setList(l => l.filter(a => a._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Post Announcement</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Announcement title" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Content *</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Announcement details..." />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input type="checkbox" checked={form.important} onChange={e => setForm(f => ({ ...f, important: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500" /> Mark as important (shown on homepage)
                </span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60">
                {saving ? 'Posting...' : 'Post Announcement'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 border text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading...</p>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No announcements yet. Post one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(a => (
            <div key={a._id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[a.category] || CAT_COLORS.general}`}>{a.category}</span>
                    {a.important && <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium"><Star className="w-3 h-3" /> Important</span>}
                    <span className="text-xs text-gray-400 ml-auto">{new Date(a.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{a.content}</p>
                </div>
                <button onClick={() => del(a._id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
