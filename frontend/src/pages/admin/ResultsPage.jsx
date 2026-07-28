import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus } from 'lucide-react';

const EXAM_TYPES = ['unit_test', 'quarterly', 'half_yearly', 'annual'];

const emptySubject = () => ({ name: '', marks: '', maxMarks: 100 });

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [filter, setFilter] = useState({ examType: '', academicYear: '' });
  const [form, setForm] = useState({
    studentId: '', examType: '', academicYear: '',
    subjects: [emptySubject()],
  });
  const [saving, setSaving] = useState(false);

  const loadResults = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filter.examType)    p.set('examType', filter.examType);
    if (filter.academicYear) p.set('academicYear', filter.academicYear);
    api.get(`/results?${p}`).then(r => setResults(r.data.data)).catch(() => toast.error('Load failed')).finally(() => setLoading(false));
  };

  useEffect(() => { loadResults(); }, [filter]);

  useEffect(() => {
    api.get('/students?limit=200').then(r => setStudents(r.data.data)).catch(() => {});
  }, []);

  const addSubject = () => setForm(f => ({ ...f, subjects: [...f.subjects, emptySubject()] }));
  const removeSubject = (i) => setForm(f => ({ ...f, subjects: f.subjects.filter((_, j) => j !== i) }));
  const setSubject = (i, k, v) => setForm(f => {
    const s = [...f.subjects];
    s[i] = { ...s[i], [k]: v };
    return { ...f, subjects: s };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.examType || !form.academicYear || !form.subjects.length) {
      toast.error('Fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const subjects = form.subjects.map(s => ({ name: s.name, marks: Number(s.marks), maxMarks: Number(s.maxMarks) }));
      await api.post('/results', { ...form, subjects });
      toast.success('Result saved');
      setView('list');
      setForm({ studentId: '', examType: '', academicYear: '', subjects: [emptySubject()] });
      loadResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this result?')) return;
    try {
      await api.delete(`/results/${id}`);
      toast.success('Deleted');
      setResults(r => r.filter(x => x._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const gradeColor = (g) => {
    if (g === 'A+' || g === 'A') return 'text-green-700 bg-green-100';
    if (g === 'B+' || g === 'B') return 'text-blue-700 bg-blue-100';
    if (g === 'C' || g === 'D') return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <button onClick={() => setView(v => v === 'add' ? 'list' : 'add')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
          <Plus className="w-4 h-4" /> {view === 'add' ? 'View Results' : 'Add Result'}
        </button>
      </div>

      {view === 'add' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Enter Result</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Student *</label>
              <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} — Class {s.class}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Exam Type *</label>
              <select value={form.examType} onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select exam</option>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Academic Year *</label>
              <input value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 2024-25" />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Subjects & Marks</label>
              <button type="button" onClick={addSubject} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                <Plus className="w-3 h-3" /> Add Subject
              </button>
            </div>
            <div className="space-y-2">
              {form.subjects.map((sub, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={sub.name} onChange={e => setSubject(i, 'name', e.target.value)}
                    placeholder="Subject name" className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="number" value={sub.marks} onChange={e => setSubject(i, 'marks', e.target.value)}
                    placeholder="Marks" className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-gray-400 text-sm">/</span>
                  <input type="number" value={sub.maxMarks} onChange={e => setSubject(i, 'maxMarks', e.target.value)}
                    placeholder="Max" className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {form.subjects.length > 1 && (
                    <button type="button" onClick={() => removeSubject(i)} className="p-1.5 text-red-400 hover:text-red-600">
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Result'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-5 flex flex-wrap gap-3">
        <select value={filter.examType} onChange={e => setFilter(f => ({ ...f, examType: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Exam Types</option>
          {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <input value={filter.academicYear} onChange={e => setFilter(f => ({ ...f, academicYear: e.target.value }))}
          placeholder="Academic Year" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36" />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Student', 'Exam', 'Subjects', 'Total', '%', 'Grade', 'Result', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No results found</td></tr>
              ) : results.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.studentId?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{r.examType?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.subjects?.map(s => s.name).join(', ')}</td>
                  <td className="px-4 py-3">{r.totalMarks}/{r.totalMaxMarks}</td>
                  <td className="px-4 py-3">{r.percentage?.toFixed(1)}%</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${gradeColor(r.grade)}`}>{r.grade}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.result}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => del(r._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
