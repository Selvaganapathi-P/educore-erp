import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

dayjs.extend(relativeTime);

const STATUS_CHIP = {
  pending:   'badge-slate',
  submitted: 'badge-primary',
  late:      'badge-warning',
  graded:    'badge-success',
  returned:  'badge-info',
};

export default function HomeworkDetailPage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const qc      = useQueryClient();

  const { data: hw, isLoading } = useQuery({
    queryKey: ['homework', id],
    queryFn:  () => api.get(`/homework/${id}`).then(r => r.data.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['homework-stats', id],
    queryFn:  () => api.get(`/homework/${id}/stats`).then(r => r.data.data),
    enabled:  !!id,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['hw-submissions', id],
    queryFn:  () => api.get(`/homework/${id}/submissions`).then(r => r.data.data),
    enabled:  !!id,
  });

  const publishMut = useMutation({
    mutationFn: () => api.patch(`/homework/${id}/publish`),
    onSuccess:  () => { toast.success('Published'); qc.invalidateQueries(['homework', id]); },
  });

  const closeMut = useMutation({
    mutationFn: () => api.patch(`/homework/${id}/close`),
    onSuccess:  () => { toast.success('Closed'); qc.invalidateQueries(['homework', id]); },
  });

  if (isLoading) return <div className="space-y-4">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div>;
  if (!hw) return <div className="card card-body text-center text-slate-400">Assignment not found.</div>;

  const isOverdue = hw.status === 'published' && dayjs().isAfter(dayjs(hw.dueDate));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/homework')} className="btn btn-icon btn-ghost"><ArrowLeft size={18}/></button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="page-title">{hw.title}</h1>
              <span className={`badge capitalize ${hw.status === 'draft' ? 'badge-slate' : hw.status === 'published' ? 'badge-success' : 'badge-error'}`}>{hw.status}</span>
              {isOverdue && <span className="badge badge-error">Overdue</span>}
            </div>
            <p className="page-subtitle">
              {hw.classId?.name}{hw.sectionId ? ` · Section ${hw.sectionId}` : ''}{hw.subjectId ? ` · ${hw.subjectId.name}` : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {hw.status !== 'closed' && (
            <button onClick={() => navigate(`/homework/${id}/edit`)} className="btn btn-outline btn-md">
              <Edit2 size={14}/> Edit
            </button>
          )}
          {hw.status === 'draft' && (
            <button onClick={() => publishMut.mutate()} disabled={publishMut.isPending} className="btn btn-primary btn-md">
              <Send size={14}/> Publish
            </button>
          )}
          {hw.status === 'published' && (
            <button onClick={() => closeMut.mutate()} disabled={closeMut.isPending} className="btn btn-outline btn-md text-slate-500">
              Close
            </button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Submitted',  value: stats?.submitted ?? 0,        color: 'text-primary-600' },
          { label: 'Graded',     value: stats?.graded ?? 0,           color: 'text-emerald-600' },
          { label: 'Avg Score',  value: stats?.avgGrade != null ? `${Number(stats.avgGrade).toFixed(1)}/${hw.maxMarks}` : '—', color: 'text-amber-600' },
          { label: 'Due',        value: dayjs(hw.dueDate).format('DD MMM'), color: isOverdue ? 'text-red-500' : 'text-slate-700' },
        ].map(s => (
          <div key={s.label} className="card card-body text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {hw.description && (
            <div className="card card-body">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{hw.description}</p>
            </div>
          )}
          {hw.instructions && (
            <div className="card card-body">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Instructions</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{hw.instructions}</p>
            </div>
          )}
        </div>

        <div className="card card-body space-y-3 self-start">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</p>
          {[
            { label: 'Type',        value: hw.type },
            { label: 'Max Marks',   value: hw.maxMarks },
            { label: 'Due Date',    value: dayjs(hw.dueDate).format('DD MMM YYYY') },
            { label: 'Late Sub.',   value: hw.allowLateSubmission ? 'Allowed' : 'Not allowed' },
            { label: 'Penalty',     value: hw.latePenaltyPct ? `${hw.latePenaltyPct}% / day` : 'None' },
            { label: 'Created by',  value: `${hw.teacherUserId?.profile?.firstName ?? ''} ${hw.teacherUserId?.profile?.lastName ?? ''}`.trim() },
            { label: 'Created',     value: dayjs(hw.createdAt).format('DD MMM YYYY') },
          ].map(d => (
            <div key={d.label} className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{d.label}</span>
              <span className="text-xs font-medium text-slate-700 capitalize">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <p className="font-semibold text-slate-700">Submissions ({submissions.length})</p>
        </div>
        {submissions.length === 0
          ? <div className="card-body text-center text-slate-400 py-10">No submissions yet.</div>
          : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Submitted</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-right">Grade</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <SubmissionRow key={sub._id} sub={sub} hw={hw} onGraded={() => {
                    qc.invalidateQueries(['hw-submissions', id]);
                    qc.invalidateQueries(['homework-stats', id]);
                  }}/>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}

function SubmissionRow({ sub, hw, onGraded }) {
  const [gradeVal, setGradeVal] = useState(sub.grade != null ? String(sub.grade) : '');
  const [feedback, setFeedback] = useState(sub.feedback ?? '');
  const [expanded, setExpanded] = useState(false);

  const gradeMut = useMutation({
    mutationFn: () => api.patch(`/homework/${sub.homeworkId}/submissions/${sub._id}/grade`, {
      grade:    Number(gradeVal),
      feedback,
    }),
    onSuccess: () => { toast.success('Graded'); onGraded(); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const name = `${sub.userId?.profile?.firstName ?? ''} ${sub.userId?.profile?.lastName ?? ''}`.trim() || '—';

  return (
    <>
      <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(p=>!p)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
              {name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{name}</p>
              {sub.studentId?.rollNumber && <p className="text-xs text-slate-400">{sub.studentId.rollNumber}</p>}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
          {sub.submittedAt ? dayjs(sub.submittedAt).format('DD MMM · HH:mm') : '—'}
          {sub.isLate && <span className="ml-2 badge badge-warning">Late</span>}
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`badge ${STATUS_CHIP[sub.status]} capitalize`}>{sub.status}</span>
        </td>
        <td className="px-4 py-3 text-right">
          {sub.status === 'graded'
            ? <span className="font-semibold text-emerald-600">{sub.finalGrade}/{hw.maxMarks}</span>
            : <span className="text-slate-400">—</span>
          }
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50 border-b border-slate-100">
          <td colSpan={4} className="px-6 py-4 space-y-3">
            {sub.content && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Student's Answer</p>
                <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200 whitespace-pre-line">{sub.content}</p>
              </div>
            )}
            <div className="flex gap-3 items-end">
              <div>
                <label className="label">Grade (/ {hw.maxMarks})</label>
                <input type="number" min={0} max={hw.maxMarks} className="input w-24"
                  value={gradeVal} onChange={e => setGradeVal(e.target.value)}/>
              </div>
              <div className="flex-1">
                <label className="label">Feedback</label>
                <input className="input w-full" placeholder="Write feedback…" value={feedback} onChange={e => setFeedback(e.target.value)}/>
              </div>
              <button onClick={() => gradeMut.mutate()} disabled={gradeMut.isPending || !gradeVal}
                className="btn btn-primary btn-sm">
                {gradeMut.isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                <CheckCircle2 size={13}/> Grade
              </button>
            </div>
            {sub.penaltyApplied > 0 && (
              <p className="text-xs text-amber-600">Late penalty applied: {sub.penaltyApplied}% — Final grade: {sub.finalGrade}</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
