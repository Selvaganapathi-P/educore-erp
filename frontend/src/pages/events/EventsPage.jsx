import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X, Calendar, Pencil, Trash2, Globe, Lock, MapPin, Users } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const EVENT_TYPES = ['academic','sports','cultural','holiday','meeting','exam','workshop','trip','other'];
const AUDIENCE    = ['all','students','staff','parents','classes'];

const TYPE_CFG = {
  academic:  { color: 'badge-primary',  bg: 'bg-primary-50',  border: 'border-primary-200',  dot: 'bg-primary-500'  },
  sports:    { color: 'badge-success',  bg: 'bg-emerald-50',  border: 'border-emerald-200',  dot: 'bg-emerald-500'  },
  cultural:  { color: 'badge-info',     bg: 'bg-pink-50',     border: 'border-pink-200',     dot: 'bg-pink-500'     },
  holiday:   { color: 'badge-warning',  bg: 'bg-amber-50',    border: 'border-amber-200',    dot: 'bg-amber-500'    },
  meeting:   { color: 'badge-default',  bg: 'bg-slate-50',    border: 'border-slate-200',    dot: 'bg-slate-400'    },
  exam:      { color: 'badge-error',    bg: 'bg-red-50',      border: 'border-red-200',      dot: 'bg-red-500'      },
  workshop:  { color: 'badge-info',     bg: 'bg-teal-50',     border: 'border-teal-200',     dot: 'bg-teal-500'     },
  trip:      { color: 'badge-primary',  bg: 'bg-purple-50',   border: 'border-purple-200',   dot: 'bg-purple-500'   },
  other:     { color: 'badge-default',  bg: 'bg-slate-50',    border: 'border-slate-200',    dot: 'bg-slate-400'    },
};

function EventModal({ open, onClose, existing }) {
  const qc     = useQueryClient();
  const isEdit = !!existing;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: existing ? {
      title:          existing.title,
      description:    existing.description || '',
      type:           existing.type        || 'other',
      startDate:      dayjs(existing.startDate).format('YYYY-MM-DDTHH:mm'),
      endDate:        existing.endDate ? dayjs(existing.endDate).format('YYYY-MM-DDTHH:mm') : '',
      venue:          existing.venue          || '',
      targetAudience: existing.targetAudience || 'all',
      isPublished:    existing.isPublished    || false,
    } : { title:'', description:'', type:'other', startDate:'', endDate:'', venue:'', targetAudience:'all', isPublished: false },
  });

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/events/events/${existing._id}`, body).then(r => r.data)
      : api.post('/events/events', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events-list'] });
      qc.invalidateQueries({ queryKey: ['events-dashboard'] });
      toast.success(isEdit ? 'Event updated' : 'Event created');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit Event' : 'New Event'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="dialog-body space-y-4">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input {...register('title',{required:true})} className="form-input" placeholder="e.g. Annual Sports Day"/>
              {errors.title && <p className="form-error">Required</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select {...register('type')} className="form-select">
                  {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Audience</label>
                <select {...register('targetAudience')} className="form-select">
                  {AUDIENCE.map(a => <option key={a} value={a} className="capitalize">{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date & Time *</label>
                <input type="datetime-local" {...register('startDate',{required:true})} className="form-input"/>
                {errors.startDate && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">End Date & Time</label>
                <input type="datetime-local" {...register('endDate')} className="form-input"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input {...register('venue')} className="form-input" placeholder="Main Hall / Ground / Class 10A"/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea {...register('description')} className="form-textarea" rows={3}/>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPublished" {...register('isPublished')} className="rounded border-slate-300"/>
              <label htmlFor="isPublished" className="text-sm text-slate-600">Publish immediately (visible to all)</label>
            </div>
            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Create Event'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function EventsPage() {
  const qc = useQueryClient();
  const [modal,     setModal]     = useState(null);
  const [typeFilter,setTypeFilter]= useState('');
  const [tab,       setTab]       = useState('upcoming');
  const [page,      setPage]      = useState(1);

  const now = dayjs().format('YYYY-MM-DD');
  const params = { page, limit: 30 };
  if (typeFilter) params.type = typeFilter;
  if (tab === 'upcoming') params.from = now;
  if (tab === 'past')     params.to   = dayjs().subtract(1,'day').format('YYYY-MM-DD');
  if (tab === 'drafts')   params.published = false;

  const { data, isLoading } = useQuery({
    queryKey: ['events-list', params],
    queryFn:  () => api.get('/events/events', { params }).then(r => r.data),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const events = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/events/events/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events-list'] });
      qc.invalidateQueries({ queryKey: ['events-dashboard'] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const togglePublish = (ev) => {
    api.put(`/events/events/${ev._id}`, { isPublished: !ev.isPublished })
      .then(() => { qc.invalidateQueries({ queryKey: ['events-list'] }); toast.success(ev.isPublished ? 'Unpublished' : 'Published'); })
      .catch(e => toast.error(e.response?.data?.message || 'Error'));
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">{data?.total ?? 0} total events</p>
        </div>
        <button onClick={() => setModal('new')} className="btn btn-primary btn-md">
          <Plus size={15}/> New Event
        </button>
      </div>

      {/* Tabs + type filter */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[['upcoming','Upcoming'],['past','Past'],['all','All'],['drafts','Drafts']].map(([v,l]) => (
            <button key={v} onClick={() => { setTab(v); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === v ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="form-select w-36">
          <option value="">All Types</option>
          {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>

      {isLoading
        ? <div className="space-y-3">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-24 rounded-xl"/>)}</div>
        : events.length === 0
          ? (
            <div className="card card-body text-center py-14 text-slate-400">
              <Calendar size={36} className="mx-auto mb-3 text-slate-300"/>
              <p>No events found.</p>
            </div>
          )
          : (
            <div className="space-y-3">
              {events.map(ev => {
                const cfg      = TYPE_CFG[ev.type] ?? TYPE_CFG.other;
                const isPast   = dayjs(ev.startDate).isBefore(dayjs());
                const isToday  = dayjs(ev.startDate).isSame(dayjs(), 'day');
                const duration = ev.endDate
                  ? `${dayjs(ev.startDate).format('HH:mm')} – ${dayjs(ev.endDate).format('HH:mm')}`
                  : dayjs(ev.startDate).format('HH:mm');

                return (
                  <div key={ev._id} className={`card flex gap-0 overflow-hidden border ${cfg.border}`}>
                    <div className={`w-14 shrink-0 flex flex-col items-center justify-center py-4 ${cfg.bg}`}>
                      <span className="text-xs font-bold uppercase text-current opacity-70">{dayjs(ev.startDate).format('MMM')}</span>
                      <span className="text-2xl font-black leading-none">{dayjs(ev.startDate).format('DD')}</span>
                      <span className="text-xs opacity-60">{dayjs(ev.startDate).format('ddd')}</span>
                    </div>
                    <div className="flex-1 px-4 py-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold text-slate-800 ${isPast && !isToday ? 'opacity-60' : ''}`}>{ev.title}</p>
                          <span className={`badge text-xs capitalize ${cfg.color}`}>{ev.type}</span>
                          {isToday && <span className="badge badge-success text-xs">Today</span>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => togglePublish(ev)} className={`btn-icon ${ev.isPublished ? 'text-emerald-600' : 'text-slate-400'}`} title={ev.isPublished ? 'Published' : 'Draft'}>
                            {ev.isPublished ? <Globe size={14}/> : <Lock size={14}/>}
                          </button>
                          <button onClick={() => setModal(ev)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={13}/></button>
                          <button onClick={() => { if (confirm('Delete this event?')) deleteMut.mutate(ev._id); }} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={11}/>{duration}</span>
                        {ev.venue && <span className="flex items-center gap-1"><MapPin size={11}/>{ev.venue}</span>}
                        <span className="flex items-center gap-1 capitalize"><Users size={11}/>{ev.targetAudience}</span>
                      </div>
                      {ev.description && <p className="text-xs text-slate-400 line-clamp-1">{ev.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )
      }

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn btn-ghost btn-xs">Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="btn btn-ghost btn-xs">Next</button>
          </div>
        </div>
      )}

      <EventModal
        open={!!modal}
        onClose={() => setModal(null)}
        existing={modal && modal !== 'new' ? modal : null}
      />
    </div>
  );
}
