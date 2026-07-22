import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Save } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const TYPES = [
  { value: 'general', label: 'General' },
  { value: 'event',   label: 'Event'   },
  { value: 'urgent',  label: 'Urgent'  },
  { value: 'holiday', label: 'Holiday' },
  { value: 'exam',    label: 'Exam'    },
  { value: 'fee',     label: 'Fee'     },
];

const ROLES = [
  'teacher','student','parent','accountant','hr',
  'librarian','nurse','receptionist','principal','vice_principal',
];

export default function AnnouncementFormPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const isEdit   = !!id;

  const { data: existing } = useQuery({
    queryKey: ['announcement', id],
    queryFn:  () => api.get(`/communication/announcements/${id}`).then(r => r.data.data),
    enabled:  isEdit,
    staleTime: 0,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn:  () => api.get('/academics/classes').then(r => r.data.data),
    staleTime: 300_000,
  });

  const { register, handleSubmit, watch, setValue, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      title: '', content: '', type: 'general',
      targetAudience: 'all', targetRoles: [], targetClasses: [],
      expiresAt: '', isPublished: false,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title:          existing.title,
        content:        existing.content,
        type:           existing.type,
        targetAudience: existing.targetAudience,
        targetRoles:    existing.targetRoles ?? [],
        targetClasses:  (existing.targetClasses ?? []).map(c => c._id ?? c),
        expiresAt:      existing.expiresAt ? existing.expiresAt.slice(0, 10) : '',
        isPublished:    existing.isPublished,
      });
    }
  }, [existing, reset]);

  const audience = watch('targetAudience');

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/communication/announcements/${id}`, body).then(r => r.data)
      : api.post('/communication/announcements', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      toast.success(isEdit ? 'Updated' : 'Created');
      navigate('/communication/announcements');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data, publish = false) => {
    mutation.mutate({ ...data, isPublished: publish || data.isPublished });
  };

  const toggleRole = (r) => {
    const curr = watch('targetRoles') ?? [];
    setValue('targetRoles', curr.includes(r) ? curr.filter(x => x !== r) : [...curr, r]);
  };

  const toggleClass = (cid) => {
    const curr = watch('targetClasses') ?? [];
    setValue('targetClasses', curr.includes(cid) ? curr.filter(x => x !== cid) : [...curr, cid]);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-icon text-slate-400 hover:text-slate-700"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Announcement' : 'New Announcement'}</h1>
            <p className="page-subtitle">Broadcast to students, staff, or parents</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => onSubmit(d, false))} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card card-body space-y-4">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input {...register('title',{required:true})} className="form-input" placeholder="Announcement title…"/>
              {errors.title && <p className="form-error">Required</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select {...register('type')} className="form-select">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea
                {...register('content',{required:true})}
                className="form-textarea"
                rows={8}
                placeholder="Write your announcement here…"
              />
              {errors.content && <p className="form-error">Required</p>}
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <div className="card card-body space-y-4">
            <p className="text-sm font-semibold text-slate-700">Target Audience</p>
            <div className="flex flex-col gap-2">
              {[['all','Everyone'],['roles','Specific Roles'],['classes','Specific Classes']].map(([v,l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('targetAudience')} value={v} className="form-radio"/>
                  <span className="text-sm text-slate-700">{l}</span>
                </label>
              ))}
            </div>

            {audience === 'roles' && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 font-medium">Select roles:</p>
                {ROLES.map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(watch('targetRoles') ?? []).includes(r)}
                      onChange={() => toggleRole(r)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-slate-600 capitalize">{r.replace(/_/g,' ')}</span>
                  </label>
                ))}
              </div>
            )}

            {audience === 'classes' && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 font-medium">Select classes:</p>
                {classes.map(c => (
                  <label key={c._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(watch('targetClasses') ?? []).includes(c._id)}
                      onChange={() => toggleClass(c._id)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-slate-600">{c.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="card card-body space-y-3">
            <p className="text-sm font-semibold text-slate-700">Schedule</p>
            <div className="form-group">
              <label className="form-label">Expires On (optional)</label>
              <input type="date" {...register('expiresAt')} className="form-input"/>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={handleSubmit((d) => onSubmit(d, true))}
              disabled={mutation.isPending}
              className="btn btn-primary btn-md w-full">
              <Send size={14}/> {mutation.isPending ? 'Publishing…' : 'Publish Now'}
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn btn-ghost btn-md w-full">
              <Save size={14}/> Save as Draft
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-md w-full text-slate-400">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
