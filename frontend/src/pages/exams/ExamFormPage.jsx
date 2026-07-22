import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const EXAM_TYPES = ['unit_test','mid_term','final','quarterly','half_yearly','annual','mock','pre_board'];
const TYPE_LABEL = { unit_test:'Unit Test', mid_term:'Mid Term', final:'Final', quarterly:'Quarterly', half_yearly:'Half Yearly', annual:'Annual', mock:'Mock', pre_board:'Pre-Board' };

export default function ExamFormPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;
  const qc       = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { type: 'mid_term' },
  });

  const [scheduleForm, setScheduleForm] = useState({ classId:'', subjectId:'', date:'', startTime:'09:00', endTime:'11:00', maxMarks:100, passMark:33, roomNo:'' });
  const [delSch, setDelSch] = useState(null);
  const [addingSlot, setAddingSlot] = useState(false);

  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data) });
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

  const { data: exam } = useQuery({
    queryKey: ['exam', id],
    queryFn:  () => api.get(`/exams/${id}`).then(r => r.data.data),
    enabled:  isEdit,
  });

  useEffect(() => {
    if (exam) {
      reset({
        name:      exam.name,
        type:      exam.type,
        description: exam.description,
        startDate: dayjs(exam.startDate).format('YYYY-MM-DD'),
        endDate:   dayjs(exam.endDate).format('YYYY-MM-DD'),
      });
    }
  }, [exam, reset]);

  const saveMut = useMutation({
    mutationFn: data => {
      const payload = { ...data, academicYearId: currentYear?._id };
      return isEdit ? api.put(`/exams/${id}`, payload) : api.post('/exams', payload);
    },
    onSuccess: res => {
      const examId = res.data.data._id;
      toast.success(isEdit ? 'Updated' : 'Exam created');
      qc.invalidateQueries(['exams']);
      if (!isEdit) navigate(`/exams/${examId}`);
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  const addSlotMut = useMutation({
    mutationFn: () => api.post(`/exams/${id}/schedule`, {
      ...scheduleForm,
      maxMarks: Number(scheduleForm.maxMarks),
      passMark: Number(scheduleForm.passMark),
    }),
    onSuccess: () => { toast.success('Schedule item added'); setAddingSlot(false); qc.invalidateQueries(['exam', id]); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const delSlotMut = useMutation({
    mutationFn: sid => api.delete(`/exams/${id}/schedule/${sid}`),
    onSuccess:  () => { toast.success('Removed'); setDelSch(null); qc.invalidateQueries(['exam', id]); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const schedule = exam?.schedule ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-icon btn-ghost"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Exam' : 'Create Exam'}</h1>
            <p className="page-subtitle">Configure exam details and subject schedule</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="card card-body space-y-4">
        <h2 className="font-semibold text-slate-700">Exam Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Exam Name *</label>
            <input className="input w-full" placeholder="e.g. Mid Term Examination 2024-25" {...register('name', { required: 'Required' })}/>
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input w-full" {...register('type')}>
              {EXAM_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date *</label>
            <input type="date" className="input w-full" {...register('startDate', { required: 'Required' })}/>
          </div>
          <div>
            <label className="label">End Date *</label>
            <input type="date" className="input w-full" {...register('endDate', { required: 'Required' })}/>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea rows={2} className="input w-full resize-none" placeholder="Optional notes…" {...register('description')}/>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saveMut.isPending} className="btn btn-primary btn-md">
            {saveMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            <Save size={15}/> {isEdit ? 'Save Changes' : 'Create & Add Schedule'}
          </button>
        </div>
      </form>

      {/* Schedule — only available after exam is created */}
      {isEdit && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <p className="font-semibold text-slate-700">Exam Schedule ({schedule.length} subjects)</p>
            <button onClick={() => setAddingSlot(p=>!p)} className="btn btn-outline btn-sm">
              <Plus size={13}/> Add Subject Slot
            </button>
          </div>

          {/* Add slot form */}
          {addingSlot && (
            <div className="px-4 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="label">Class *</label>
                <select className="input w-full" value={scheduleForm.classId} onChange={e => setScheduleForm(p=>({...p, classId:e.target.value}))}>
                  <option value="">Select class</option>
                  {classes.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Subject</label>
                <select className="input w-full" value={scheduleForm.subjectId} onChange={e => setScheduleForm(p=>({...p, subjectId:e.target.value}))}>
                  <option value="">Select subject</option>
                  {subjects.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input w-full" value={scheduleForm.date} onChange={e => setScheduleForm(p=>({...p, date:e.target.value}))}/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Start</label>
                  <input type="time" className="input w-full text-xs" value={scheduleForm.startTime} onChange={e => setScheduleForm(p=>({...p, startTime:e.target.value}))}/>
                </div>
                <div>
                  <label className="label">End</label>
                  <input type="time" className="input w-full text-xs" value={scheduleForm.endTime} onChange={e => setScheduleForm(p=>({...p, endTime:e.target.value}))}/>
                </div>
              </div>
              <div>
                <label className="label">Max Marks *</label>
                <input type="number" className="input w-full" value={scheduleForm.maxMarks} onChange={e => setScheduleForm(p=>({...p, maxMarks:e.target.value}))}/>
              </div>
              <div>
                <label className="label">Pass Mark *</label>
                <input type="number" className="input w-full" value={scheduleForm.passMark} onChange={e => setScheduleForm(p=>({...p, passMark:e.target.value}))}/>
              </div>
              <div>
                <label className="label">Room No</label>
                <input className="input w-full" value={scheduleForm.roomNo} onChange={e => setScheduleForm(p=>({...p, roomNo:e.target.value}))} placeholder="101"/>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={() => addSlotMut.mutate()} disabled={addSlotMut.isPending || !scheduleForm.classId || !scheduleForm.date}
                  className="btn btn-primary btn-sm flex-1">
                  {addSlotMut.isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                  Add
                </button>
                <button onClick={() => setAddingSlot(false)} className="btn btn-ghost btn-sm">Cancel</button>
              </div>
            </div>
          )}

          {/* Schedule table */}
          {schedule.length === 0
            ? <div className="card-body text-center text-slate-400 py-8">No subjects added to the schedule yet.</div>
            : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Class</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Subject</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Time</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Marks</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Pass</th>
                    <th className="px-4 py-3"/>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(s => (
                    <tr key={s._id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.classId?.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {s.subjectId ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: s.subjectId.color }}/>
                            {s.subjectId.name}
                          </span>
                        ) : s.subjectName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{dayjs(s.date).format('DD MMM YYYY')}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{s.startTime} – {s.endTime}</td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-slate-700">{s.maxMarks}</td>
                      <td className="px-4 py-3 text-sm text-center text-slate-500">{s.passMark}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setDelSch(s)} className="btn btn-icon btn-ghost text-red-400"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}

      <ConfirmDialog open={!!delSch} onClose={() => setDelSch(null)}
        onConfirm={() => delSlotMut.mutate(delSch._id)} loading={delSlotMut.isPending}
        danger title="Remove Schedule Item" message={`Remove this subject from the schedule?`} confirmLabel="Remove"/>
    </div>
  );
}
