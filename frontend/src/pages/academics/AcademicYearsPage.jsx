import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Calendar, Star, Trash2, Edit2, ChevronDown, ChevronUp, X } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../lib/axios';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function AcademicYearsPage() {
  const qc = useQueryClient();
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [delTarget, setDel]     = useState(null);
  const [holidayYear, setHolidayYear] = useState(null);

  const { data: years = [], isLoading } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  () => api.get('/academics/years').then(r => r.data.data),
  });

  const saveMut = useMutation({
    mutationFn: data => editing
      ? api.put(`/academics/years/${editing._id}`, data)
      : api.post('/academics/years', data),
    onSuccess: () => {
      toast.success(editing ? 'Year updated' : 'Year created');
      setOpen(false); setEditing(null);
      qc.invalidateQueries(['academic-years']);
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  const setCurrentMut = useMutation({
    mutationFn: id => api.put(`/academics/years/${id}`, { isCurrent: true }),
    onSuccess: () => { toast.success('Set as current year'); qc.invalidateQueries(['academic-years']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/academics/years/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDel(null); qc.invalidateQueries(['academic-years']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Delete failed'),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  function openCreate() { reset({ isCurrent: false }); setEditing(null); setOpen(true); }
  function openEdit(y)  { reset({ name: y.name, startDate: y.startDate?.slice(0,10), endDate: y.endDate?.slice(0,10), isCurrent: y.isCurrent }); setEditing(y); setOpen(true); }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Years</h1>
          <p className="page-subtitle">Manage academic sessions and school holidays</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-md"><Plus size={16}/> New Year</button>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)
          : years.map(y => (
            <div key={y._id} className="card overflow-hidden">
              <div className="card-body flex items-center gap-4">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  y.isCurrent ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400')}>
                  <Calendar size={18}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{y.name}</p>
                    {y.isCurrent && <span className="badge badge-success">Current</span>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {dayjs(y.startDate).format('DD MMM YYYY')} – {dayjs(y.endDate).format('DD MMM YYYY')}
                    {' · '}{y.holidays?.length ?? 0} holidays
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!y.isCurrent && (
                    <button onClick={() => setCurrentMut.mutate(y._id)}
                      className="btn btn-ghost btn-sm gap-1 text-slate-500 hover:text-primary-600">
                      <Star size={14}/> Set Current
                    </button>
                  )}
                  <button onClick={() => openEdit(y)} className="btn btn-icon btn-ghost"><Edit2 size={15}/></button>
                  <button onClick={() => setHolidayYear(y)} className="btn btn-outline btn-sm">Holidays</button>
                  <button onClick={() => setExpanded(expanded === y._id ? null : y._id)} className="btn btn-icon btn-ghost">
                    {expanded === y._id ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                  </button>
                  <button onClick={() => setDel(y)} className="btn btn-icon btn-ghost text-red-400 hover:text-red-600">
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
              {expanded === y._id && y.holidays?.length > 0 && (
                <div className="px-6 pb-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-2">Holidays</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {y.holidays.map(h => (
                      <div key={h._id} className="flex items-center gap-2 text-sm">
                        <span className={clsx('w-2 h-2 rounded-full shrink-0',
                          h.type === 'national' ? 'bg-red-400' : h.type === 'religious' ? 'bg-orange-400' : 'bg-blue-400')}/>
                        <span className="text-slate-700">{h.name}</span>
                        <span className="text-slate-400 text-xs ml-auto">{dayjs(h.date).format('DD MMM')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>

      {/* Year form modal */}
      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }}
        title={editing ? 'Edit Academic Year' : 'New Academic Year'} size="sm">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Year Name *</label>
            <input className="input w-full" placeholder="2024-25" {...register('name', { required: true })}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date *</label>
              <input type="date" className="input w-full" {...register('startDate', { required: true })}/>
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="date" className="input w-full" {...register('endDate', { required: true })}/>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isCurrent')} className="w-4 h-4 rounded text-primary-600"/>
            <span className="text-sm text-slate-600">Set as current academic year</span>
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-md">Cancel</button>
            <button type="submit" disabled={saveMut.isPending} className="btn btn-primary btn-md">
              {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              Save
            </button>
          </div>
        </form>
      </Modal>

      {holidayYear && <HolidayModal year={holidayYear} onClose={() => setHolidayYear(null)}/>}

      <ConfirmDialog open={!!delTarget} onClose={() => setDel(null)}
        onConfirm={() => deleteMut.mutate(delTarget._id)} loading={deleteMut.isPending}
        danger title="Delete Academic Year" message={`Delete "${delTarget?.name}"?`} confirmLabel="Delete"/>
    </div>
  );
}

function HolidayModal({ year, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { type: 'school', optional: false } });

  const addMut = useMutation({
    mutationFn: data => api.post(`/academics/years/${year._id}/holidays`, data),
    onSuccess: () => { toast.success('Holiday added'); reset(); qc.invalidateQueries(['academic-years']); },
    onError:   e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const delMut = useMutation({
    mutationFn: hid => api.delete(`/academics/years/${year._id}/holidays/${hid}`),
    onSuccess: () => { toast.success('Removed'); qc.invalidateQueries(['academic-years']); },
    onError:   e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const { data: fresh } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  () => api.get('/academics/years').then(r => r.data.data),
  });
  const current = fresh?.find(y => y._id === year._id) ?? year;

  return (
    <Modal open onClose={onClose} title={`Holidays — ${year.name}`} size="lg">
      <form onSubmit={handleSubmit(d => addMut.mutate(d))} className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-slate-100">
        <input className="input flex-1 min-w-36" placeholder="Holiday name *" {...register('name', { required: true })}/>
        <input type="date" className="input w-36" {...register('date', { required: true })}/>
        <select className="input w-32" {...register('type')}>
          {['national','religious','school','other'].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <button type="submit" disabled={addMut.isPending} className="btn btn-primary btn-sm">
          <Plus size={14}/> Add
        </button>
      </form>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {current.holidays?.length === 0 && <p className="text-sm text-slate-400">No holidays added yet.</p>}
        {current.holidays?.map(h => (
          <div key={h._id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-50">
            <span className={clsx('w-2 h-2 rounded-full shrink-0',
              h.type === 'national' ? 'bg-red-400' : h.type === 'religious' ? 'bg-orange-400' : 'bg-blue-400')}/>
            <span className="flex-1 text-sm text-slate-700">{h.name}</span>
            <span className="text-xs text-slate-400 w-20 text-right">{dayjs(h.date).format('DD MMM YYYY')}</span>
            <span className="badge badge-slate capitalize w-20 justify-center">{h.type}</span>
            <button onClick={() => delMut.mutate(h._id)} className="btn btn-icon btn-ghost text-red-400 hover:text-red-600">
              <X size={13}/>
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
