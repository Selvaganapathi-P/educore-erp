import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X, Search, UserCheck, Trash2, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

function VisitModal({ open, onClose, existing }) {
  const qc     = useQueryClient();
  const isEdit = !!existing;

  const [memberModel, setMemberModel] = useState(existing?.memberModel || 'Student');
  const [search,      setSearch]      = useState('');
  const [selMember,   setSelMember]   = useState(null);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: existing ? {
      memberId: existing.memberId?._id || '',
      memberModel: existing.memberModel,
      visitDate:    dayjs(existing.visitDate).format('YYYY-MM-DD'),
      complaint:    existing.complaint    || '',
      diagnosis:    existing.diagnosis    || '',
      treatment:    existing.treatment    || '',
      prescriptions: existing.prescriptions || [],
      temperatureF:  existing.temperatureF || '',
      bp:            existing.bp           || '',
      pulseRate:     existing.pulseRate    || '',
      followUpDate:  existing.followUpDate ? dayjs(existing.followUpDate).format('YYYY-MM-DD') : '',
      notes:         existing.notes        || '',
    } : {
      memberId: '', memberModel: 'Student',
      visitDate: dayjs().format('YYYY-MM-DD'),
      complaint:'', diagnosis:'', treatment:'',
      prescriptions: [],
      temperatureF:'', bp:'', pulseRate:'', followUpDate:'', notes:'',
    },
  });

  const { fields: rxFields, append: rxAppend, remove: rxRemove } = useFieldArray({ control, name: 'prescriptions' });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['visit-member-search', memberModel, search],
    queryFn:  () => {
      if (search.length < 2) return [];
      const url = memberModel === 'Student' ? '/students' : '/staff';
      return api.get(url, { params: { search, limit: 8 } }).then(r => r.data.data);
    },
    enabled: search.length >= 2 && !isEdit,
    staleTime: 15_000,
  });

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/health/visits/${existing._id}`, body).then(r => r.data)
      : api.post('/health/visits', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health-visits'] });
      qc.invalidateQueries({ queryKey: ['health-dashboard'] });
      toast.success(isEdit ? 'Visit updated' : 'Visit logged');
      onClose(); reset(); setSelMember(null); setSearch('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const mName = (m) => {
    const p = m?.userId?.profile || m?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : m?.rollNumber || m?.employeeId || '—';
  };

  const existingName = existing?.memberId ? mName(existing.memberId) : '';

  const onSubmit = (d) => mutation.mutate({
    ...d,
    memberId:     isEdit ? undefined : (selMember?._id || d.memberId),
    memberModel:  isEdit ? undefined : memberModel,
    temperatureF: d.temperatureF ? Number(d.temperatureF) : undefined,
    pulseRate:    d.pulseRate    ? Number(d.pulseRate)    : undefined,
    prescriptions: d.prescriptions.filter(p => p.medicine?.trim()),
  });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-2xl">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit Visit' : 'Log Medical Visit'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            {/* Member */}
            {isEdit
              ? (
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{existingName}</span>
                  <span className="text-slate-400 ml-2 text-xs">{existing.memberModel}</span>
                </div>
              )
              : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {['Student','Staff'].map(m => (
                      <button key={m} type="button" onClick={() => { setMemberModel(m); setSearch(''); setSelMember(null); setValue('memberId',''); }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${memberModel === m ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-primary-300'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                  {selMember
                    ? (
                      <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                        <UserCheck size={13} className="text-primary-600"/>
                        <span className="flex-1 text-sm font-medium">{mName(selMember)}</span>
                        <button type="button" onClick={() => { setSelMember(null); setValue('memberId',''); setSearch(''); }} className="btn-icon text-slate-400"><X size={12}/></button>
                      </div>
                    )
                    : (
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8 text-sm"
                          placeholder={`Search ${memberModel === 'Student' ? 'student' : 'staff'}…`}/>
                        {searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-44 overflow-y-auto divide-y divide-slate-100">
                            {searchResults.map(m => (
                              <button key={m._id} type="button" onClick={() => { setSelMember(m); setValue('memberId', m._id); setSearch(''); }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left">
                                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">
                                  {mName(m)[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{mName(m)}</p>
                                  <p className="text-xs text-slate-400">{m.rollNumber || m.employeeId}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                  <input type="hidden" {...register('memberId', { required: true })}/>
                  {errors.memberId && <p className="form-error text-xs">Select a member</p>}
                </div>
              )
            }

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Visit Date</label>
                <input type="date" {...register('visitDate')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input type="date" {...register('followUpDate')} className="form-input"/>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Complaint / Reason *</label>
              <textarea {...register('complaint', { required: true })} className="form-textarea" rows={2} placeholder="Chief complaint…"/>
              {errors.complaint && <p className="form-error">Required</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input {...register('diagnosis')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Treatment</label>
                <input {...register('treatment')} className="form-input"/>
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Temp (°F)</label>
                <input type="number" step="0.1" {...register('temperatureF')} className="form-input" placeholder="98.6"/>
              </div>
              <div className="form-group">
                <label className="form-label">BP</label>
                <input {...register('bp')} className="form-input" placeholder="120/80"/>
              </div>
              <div className="form-group">
                <label className="form-label">Pulse (bpm)</label>
                <input type="number" {...register('pulseRate')} className="form-input"/>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="form-label mb-0">Prescriptions</label>
                <button type="button" onClick={() => rxAppend({ medicine:'', dosage:'', duration:'' })} className="btn btn-ghost btn-xs">
                  <Plus size={11}/> Add
                </button>
              </div>
              {rxFields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input {...register(`prescriptions.${i}.medicine`)} className="form-input flex-1 text-sm" placeholder="Medicine"/>
                  <input {...register(`prescriptions.${i}.dosage`)}   className="form-input w-28 text-sm" placeholder="Dosage"/>
                  <input {...register(`prescriptions.${i}.duration`)} className="form-input w-24 text-sm" placeholder="Duration"/>
                  <button type="button" onClick={() => rxRemove(i)} className="btn-icon text-slate-400 hover:text-red-500 shrink-0"><Trash2 size={13}/></button>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea {...register('notes')} className="form-textarea" rows={2}/>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update Visit' : 'Log Visit'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function VisitRow({ visit, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const mName = (m) => {
    const p = m?.userId?.profile || m?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : m?.rollNumber || m?.employeeId || '—';
  };

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown size={13} className="text-slate-400"/> : <ChevronRight size={13} className="text-slate-400"/>}
            <div>
              <p className="text-sm font-medium text-slate-700">{mName(visit.memberId)}</p>
              <span className={`badge text-xs ${visit.memberModel === 'Student' ? 'badge-primary' : 'badge-warning'}`}>{visit.memberModel}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{visit.complaint}</td>
        <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{visit.diagnosis || '—'}</td>
        <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">{dayjs(visit.visitDate).format('DD MMM YYYY')}</td>
        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => onEdit(visit)} className="btn-icon text-slate-400 hover:text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button onClick={() => onDelete(visit._id)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50 border-b border-slate-200">
          <td colSpan={5} className="px-8 py-4">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {visit.treatment && (
                <div><p className="text-xs text-slate-400 mb-0.5">Treatment</p><p className="text-slate-700">{visit.treatment}</p></div>
              )}
              {(visit.temperatureF || visit.bp || visit.pulseRate) && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Vitals</p>
                  <div className="space-y-0.5 text-slate-700">
                    {visit.temperatureF && <p>Temp: {visit.temperatureF}°F</p>}
                    {visit.bp && <p>BP: {visit.bp}</p>}
                    {visit.pulseRate && <p>Pulse: {visit.pulseRate} bpm</p>}
                  </div>
                </div>
              )}
              {visit.prescriptions?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Prescriptions</p>
                  <div className="space-y-1">
                    {visit.prescriptions.map((rx, i) => (
                      <p key={i} className="text-slate-700"><span className="font-medium">{rx.medicine}</span>{rx.dosage ? ` — ${rx.dosage}` : ''}{rx.duration ? ` (${rx.duration})` : ''}</p>
                    ))}
                  </div>
                </div>
              )}
              {visit.followUpDate && (
                <div><p className="text-xs text-slate-400 mb-0.5">Follow-up</p><p className="text-slate-700 font-medium">{dayjs(visit.followUpDate).format('DD MMM YYYY')}</p></div>
              )}
              {visit.notes && (
                <div className="sm:col-span-3"><p className="text-xs text-slate-400 mb-0.5">Notes</p><p className="text-slate-600">{visit.notes}</p></div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function MedicalVisitsPage() {
  const qc = useQueryClient();
  const [open,         setOpen]         = useState(false);
  const [editVisit,    setEditVisit]    = useState(null);
  const [memberFilter, setMemberFilter] = useState('');
  const [from,         setFrom]         = useState('');
  const [to,           setTo]           = useState('');
  const [page,         setPage]         = useState(1);

  const params = { page, limit: 30 };
  if (memberFilter) params.memberModel = memberFilter;
  if (from) params.from = from;
  if (to)   params.to   = to;

  const { data, isLoading } = useQuery({
    queryKey: ['health-visits', params],
    queryFn:  () => api.get('/health/visits', { params }).then(r => r.data),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const visits = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/health/visits/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health-visits'] });
      qc.invalidateQueries({ queryKey: ['health-dashboard'] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Visits</h1>
          <p className="page-subtitle">{data?.total ?? 0} visit records</p>
        </div>
        <button onClick={() => { setEditVisit(null); setOpen(true); }} className="btn btn-primary btn-md">
          <Plus size={15}/> Log Visit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {[['','All'],['Student','Students'],['Staff','Staff']].map(([v,l]) => (
            <button key={v} onClick={() => { setMemberFilter(v); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${memberFilter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} className="form-input w-36 text-sm" placeholder="From"/>
          <span className="text-slate-400 text-xs">to</span>
          <input type="date" value={to}   onChange={e => { setTo(e.target.value);   setPage(1); }} className="form-input w-36 text-sm"/>
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); }} className="btn-icon text-slate-400"><X size={13}/></button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-14 rounded-lg"/>)}</div>
          : visits.length === 0
            ? (
              <div className="card-body text-center py-14 text-slate-400">
                <Activity size={32} className="mx-auto mb-2 text-slate-300"/>
                <p>No visits recorded yet.</p>
              </div>
            )
            : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Member</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Complaint</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Diagnosis</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Date</th>
                      <th className="px-4 py-3"/>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map(v => (
                      <VisitRow key={v._id} visit={v}
                        onEdit={(v) => { setEditVisit(v); setOpen(true); }}
                        onDelete={(id) => { if (confirm('Delete this visit?')) deleteMut.mutate(id); }}
                      />
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn btn-ghost btn-xs">Previous</button>
                      <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="btn btn-ghost btn-xs">Next</button>
                    </div>
                  </div>
                )}
              </>
            )
        }
      </div>

      <VisitModal
        open={open}
        onClose={() => { setOpen(false); setEditVisit(null); }}
        existing={editVisit}
      />
    </div>
  );
}
