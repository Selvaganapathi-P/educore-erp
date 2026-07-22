import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function HomeworkFormPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { type: 'homework', maxMarks: 10, allowLateSubmission: true, latePenaltyPct: 0 },
  });

  const classId = watch('classId');

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  () => api.get('/academics/years').then(r => r.data.data),
  });
  const currentYear = years.find(y => y.isCurrent);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', currentYear?._id],
    queryFn:  () => api.get('/academics/classes', { params: { academicYearId: currentYear._id } }).then(r => r.data.data),
    enabled:  !!currentYear?._id,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', currentYear?._id],
    queryFn:  () => api.get('/academics/subjects', { params: { academicYearId: currentYear._id } }).then(r => r.data.data),
    enabled:  !!currentYear?._id,
  });

  const { data: existing } = useQuery({
    queryKey: ['homework', id],
    queryFn:  () => api.get(`/homework/${id}`).then(r => r.data.data),
    enabled:  isEdit,
  });

  useEffect(() => {
    if (existing) {
      reset({
        title:               existing.title,
        description:         existing.description,
        instructions:        existing.instructions,
        classId:             existing.classId?._id ?? '',
        sectionId:           existing.sectionId ?? '',
        subjectId:           existing.subjectId?._id ?? '',
        type:                existing.type,
        dueDate:             dayjs(existing.dueDate).format('YYYY-MM-DD'),
        maxMarks:            existing.maxMarks,
        allowLateSubmission: existing.allowLateSubmission,
        latePenaltyPct:      existing.latePenaltyPct,
      });
    }
  }, [existing, reset]);

  const selectedClass = classes.find(c => c._id === classId);
  const sections      = (selectedClass?.sections ?? []).filter(s => !s.isDeleted);

  const saveMut = useMutation({
    mutationFn: data => {
      const payload = {
        ...data,
        academicYearId: currentYear?._id,
        maxMarks:       Number(data.maxMarks),
        latePenaltyPct: Number(data.latePenaltyPct),
        allowLateSubmission: data.allowLateSubmission === 'true' || data.allowLateSubmission === true,
      };
      return isEdit ? api.put(`/homework/${id}`, payload) : api.post('/homework', payload);
    },
    onSuccess: data => {
      toast.success(isEdit ? 'Updated' : 'Created');
      navigate(`/homework/${data.data.data._id}`);
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-icon btn-ghost"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Assignment' : 'Create Assignment'}</h1>
            <p className="page-subtitle">Fill in the details for the homework or assignment</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-6">
        {/* Basic info */}
        <div className="card card-body space-y-4">
          <h2 className="font-semibold text-slate-700">Basic Information</h2>
          <div>
            <label className="label">Title *</label>
            <input className="input w-full" placeholder="e.g. Chapter 3 Exercises" {...register('title', { required: 'Title is required' })}/>
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input w-full" {...register('type')}>
                {['homework','assignment','project','classwork'].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Max Marks</label>
              <input type="number" min={0} className="input w-full" {...register('maxMarks')}/>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input w-full resize-none" placeholder="Brief description of the assignment…" {...register('description')}/>
          </div>
          <div>
            <label className="label">Instructions</label>
            <textarea rows={4} className="input w-full resize-none" placeholder="Step-by-step instructions for students…" {...register('instructions')}/>
          </div>
        </div>

        {/* Class & subject */}
        <div className="card card-body space-y-4">
          <h2 className="font-semibold text-slate-700">Class & Subject</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Class *</label>
              <select className="input w-full" {...register('classId', { required: 'Class is required' })}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.classId && <p className="form-error">{errors.classId.message}</p>}
            </div>
            <div>
              <label className="label">Section <span className="text-slate-400">(optional — blank = all sections)</span></label>
              <select className="input w-full" {...register('sectionId')} disabled={!classId}>
                <option value="">All sections</option>
                {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Subject</label>
              <select className="input w-full" {...register('subjectId')}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date *</label>
              <input type="date" className="input w-full" {...register('dueDate', { required: 'Due date is required' })}/>
              {errors.dueDate && <p className="form-error">{errors.dueDate.message}</p>}
            </div>
          </div>
        </div>

        {/* Submission settings */}
        <div className="card card-body space-y-4">
          <h2 className="font-semibold text-slate-700">Submission Settings</h2>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="allowLate" {...register('allowLateSubmission')} className="w-4 h-4 rounded text-primary-600"/>
            <label htmlFor="allowLate" className="text-sm text-slate-600 cursor-pointer">Allow late submissions</label>
          </div>
          <div className="w-48">
            <label className="label">Late penalty (%)</label>
            <input type="number" min={0} max={100} className="input w-full" placeholder="0" {...register('latePenaltyPct')}/>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline btn-md">Cancel</button>
          <button type="submit" disabled={saveMut.isPending} className="btn btn-primary btn-md">
            {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            <Save size={16}/> {isEdit ? 'Save Changes' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}
