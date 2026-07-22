import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, BookOpen, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#EC4899','#14B8A6','#6366F1'];
const TYPE_BADGE = { theory:'badge-primary', practical:'badge-warning', both:'badge-info', activity:'badge-success' };

export default function SubjectsPage() {
  const qc = useQueryClient();
  const [yearFilter, setYearFilter] = useState('');
  const [open, setOpen]     = useState(false);
  const [editing, setEdit]  = useState(null);
  const [delTarget, setDel] = useState(null);

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  () => api.get('/academics/years').then(r => r.data.data),
  });
  const currentYear = years.find(y => y.isCurrent)?._id ?? '';

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', yearFilter || currentYear],
    queryFn:  () => api.get('/academics/subjects', { params: { academicYearId: yearFilter || currentYear } }).then(r => r.data.data),
    enabled:  !!(yearFilter || currentYear),
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { type: 'theory', color: '#3B82F6', isElective: false, isMandatory: true, maxMarks: 100, passMarks: 33, creditHours: 1 },
  });
  const selectedColor = watch('color');

  const saveMut = useMutation({
    mutationFn: data => {
      const payload = { ...data, maxMarks: Number(data.maxMarks), passMarks: Number(data.passMarks), creditHours: Number(data.creditHours) };
      if (!editing) payload.academicYearId = yearFilter || currentYear;
      return editing ? api.put(`/academics/subjects/${editing._id}`, payload) : api.post('/academics/subjects', payload);
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Subject created'); setOpen(false); setEdit(null); qc.invalidateQueries(['subjects']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/academics/subjects/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDel(null); qc.invalidateQueries(['subjects']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  function openCreate() { reset({ type:'theory', color:'#3B82F6', isElective:false, isMandatory:true, maxMarks:100, passMarks:33, creditHours:1 }); setEdit(null); setOpen(true); }
  function openEdit(s)  { reset({ name:s.name, code:s.code??'', type:s.type, color:s.color, isElective:s.isElective, isMandatory:s.isMandatory, maxMarks:s.maxMarks, passMarks:s.passMarks, creditHours:s.creditHours }); setEdit(s); setOpen(true); }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-subtitle">Define subjects and assign them to classes</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-md"><Plus size={16}/> Add Subject</button>
      </div>

      {/* Year filter */}
      <div className="flex gap-2 flex-wrap">
        {years.map(y => (
          <button key={y._id} onClick={() => setYearFilter(y._id === (yearFilter || currentYear) ? '' : y._id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${(yearFilter || currentYear) === y._id ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            {y.name}{y.isCurrent ? ' ★' : ''}
          </button>
        ))}
      </div>

      {/* Subject cards */}
      {isLoading
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-28 rounded-xl"/>)}</div>
        : subjects.length === 0
          ? <div className="card card-body"><EmptyState icon={BookOpen} title="No subjects yet" description="Add subjects for the selected academic year."/></div>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(s => (
                <div key={s._id} className="card overflow-hidden">
                  <div className="h-1.5" style={{ background: s.color }}/>
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{s.name}</p>
                        {s.code && <p className="text-xs text-slate-400 font-mono">{s.code}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(s)} className="btn btn-icon btn-ghost"><Edit2 size={14}/></button>
                        <button onClick={() => setDel(s)} className="btn btn-icon btn-ghost text-red-400"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`badge ${TYPE_BADGE[s.type] ?? 'badge-slate'} capitalize`}>{s.type}</span>
                      {s.isElective   && <span className="badge badge-warning">Elective</span>}
                      {!s.isMandatory && <span className="badge badge-slate">Optional</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Max: {s.maxMarks}</span>
                      <span>Pass: {s.passMarks}</span>
                      <span>Credits: {s.creditHours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <Modal open={open} onClose={() => { setOpen(false); setEdit(null); }}
        title={editing ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject Name *</label>
              <input className="input w-full" {...register('name', { required: true })} placeholder="Mathematics"/>
            </div>
            <div>
              <label className="label">Code</label>
              <input className="input w-full" {...register('code')} placeholder="MATH01"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input w-full" {...register('type')}>
                {['theory','practical','both','activity'].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Credit Hours</label>
              <input type="number" min={1} className="input w-full" {...register('creditHours')}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Max Marks</label>
              <input type="number" className="input w-full" {...register('maxMarks')}/>
            </div>
            <div>
              <label className="label">Pass Marks</label>
              <input type="number" className="input w-full" {...register('passMarks')}/>
            </div>
          </div>
          <div>
            <label className="label">Color (for timetable)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setValue('color', c)}
                  style={{ background: c }}
                  className={`w-7 h-7 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}/>
              ))}
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" {...register('isElective')} className="w-4 h-4 rounded"/> Elective
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" {...register('isMandatory')} className="w-4 h-4 rounded"/> Mandatory
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-md">Cancel</button>
            <button type="submit" disabled={saveMut.isPending} className="btn btn-primary btn-md">
              {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!delTarget} onClose={() => setDel(null)}
        onConfirm={() => deleteMut.mutate(delTarget._id)} loading={deleteMut.isPending}
        danger title="Delete Subject" message={`Delete "${delTarget?.name}"?`} confirmLabel="Delete"/>
    </div>
  );
}
