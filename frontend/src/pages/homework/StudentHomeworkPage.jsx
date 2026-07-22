import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { Modal } from '../../components/ui/Modal';

dayjs.extend(relativeTime);

const TABS = [
  { key: 'pending',   label: 'Pending',  icon: Clock },
  { key: 'submitted', label: 'Submitted', icon: Send },
  { key: 'graded',    label: 'Graded',   icon: CheckCircle2 },
];

const TYPE_COLOR = {
  homework:   '#3B82F6',
  assignment: '#F59E0B',
  project:    '#06B6D4',
  classwork:  '#10B981',
};

export default function StudentHomeworkPage() {
  const qc     = useQueryClient();
  const [tab, setTab]       = useState('pending');
  const [target, setTarget] = useState(null); // homework to submit

  const { data: all = [], isLoading } = useQuery({
    queryKey: ['student-homework'],
    queryFn:  () => api.get('/homework/student/my').then(r => r.data.data),
  });

  const pending   = all.filter(h => !h.submission && h.status === 'published');
  const submitted = all.filter(h => h.submission && ['submitted','late'].includes(h.submission.status));
  const graded    = all.filter(h => h.submission?.status === 'graded');

  const current = tab === 'pending' ? pending : tab === 'submitted' ? submitted : graded;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Homework</h1>
          <p className="page-subtitle">View and submit your assignments</p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border
              ${tab === t.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            <t.icon size={14}/>
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {t.key === 'pending' ? pending.length : t.key === 'submitted' ? submitted.length : graded.length}
            </span>
          </button>
        ))}
      </div>

      {isLoading
        ? <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-28 rounded-xl"/>)}</div>
        : current.length === 0
          ? (
            <div className="card card-body flex items-center justify-center h-48">
              <div className="text-center">
                <BookOpen size={32} className="mx-auto text-slate-200 mb-2"/>
                <p className="text-slate-400">No {tab} assignments</p>
              </div>
            </div>
          )
          : (
            <div className="space-y-3">
              {current.map(hw => (
                <HomeworkCard key={hw._id} hw={hw} tab={tab} onSubmit={() => setTarget(hw)}/>
              ))}
            </div>
          )
      }

      {target && (
        <SubmitModal hw={target} onClose={() => setTarget(null)}
          onDone={() => { setTarget(null); qc.invalidateQueries(['student-homework']); }}/>
      )}
    </div>
  );
}

function HomeworkCard({ hw, tab, onSubmit }) {
  const sub     = hw.submission;
  const color   = hw.subjectId?.color ?? TYPE_COLOR[hw.type] ?? '#94a3b8';
  const overdue = hw.isOverdue;
  const dueStr  = dayjs(hw.dueDate).format('DD MMM YYYY');
  const fromNow = dayjs(hw.dueDate).fromNow();

  return (
    <div className="card overflow-hidden">
      <div className="flex items-stretch">
        <div className="w-1 shrink-0" style={{ background: color }}/>
        <div className="flex-1 card-body">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="badge capitalize" style={{ background: `${color}20`, color }}>{hw.type}</span>
                {sub?.isLate  && <span className="badge badge-warning">Late submission</span>}
                {overdue      && <span className="badge badge-error">Overdue</span>}
              </div>
              <h3 className="font-semibold text-slate-800">{hw.title}</h3>
              {hw.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{hw.description}</p>}

              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                {hw.subjectId && <span style={{ color: hw.subjectId.color }}>{hw.subjectId.name}</span>}
                <span>{hw.classId?.name}</span>
                <span className="flex items-center gap-1">
                  <Clock size={11}/> Due {dueStr}
                  {tab === 'pending' && <span className="text-slate-400 ml-1">({fromNow})</span>}
                </span>
                <span>Max: {hw.maxMarks} marks</span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {tab === 'pending' && (
                <button onClick={onSubmit}
                  className={`btn btn-sm ${overdue ? 'btn-outline text-amber-600 border-amber-300' : 'btn-primary'}`}>
                  <Send size={13}/> Submit
                </button>
              )}
              {tab === 'submitted' && (
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={18}/>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{dayjs(sub.submittedAt).format('DD MMM')}</p>
                </div>
              )}
              {tab === 'graded' && (
                <div className="text-center">
                  <p className={`text-2xl font-bold ${sub.finalGrade / hw.maxMarks >= 0.6 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {sub.finalGrade}
                  </p>
                  <p className="text-xs text-slate-400">/ {hw.maxMarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Graded feedback */}
          {tab === 'graded' && sub?.feedback && (
            <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-slate-500 mb-0.5">Teacher's Feedback</p>
              <p className="text-sm text-slate-700">{sub.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmitModal({ hw, onClose, onDone }) {
  const [content, setContent] = useState('');

  const submitMut = useMutation({
    mutationFn: () => api.post(`/homework/${hw._id}/submit`, { content }),
    onSuccess:  () => { toast.success('Submitted!'); onDone(); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Submission failed'),
  });

  return (
    <Modal open onClose={onClose} title={`Submit: ${hw.title}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
          <span>Max marks: <strong className="text-slate-700">{hw.maxMarks}</strong></span>
          <span>Due: <strong className="text-slate-700">{dayjs(hw.dueDate).format('DD MMM YYYY')}</strong></span>
          {dayjs().isAfter(dayjs(hw.dueDate)) && <span className="text-amber-600 font-medium flex items-center gap-1"><AlertCircle size={13}/> Late submission</span>}
        </div>

        {hw.instructions && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Instructions</p>
            <p className="text-sm text-slate-600 bg-blue-50 rounded-lg p-3 whitespace-pre-line">{hw.instructions}</p>
          </div>
        )}

        <div>
          <label className="label">Your Answer / Work *</label>
          <textarea rows={8} className="input w-full resize-none"
            placeholder="Type your answer here…"
            value={content} onChange={e => setContent(e.target.value)}/>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-outline btn-md">Cancel</button>
          <button onClick={() => submitMut.mutate()} disabled={submitMut.isPending || !content.trim()}
            className="btn btn-primary btn-md">
            {submitMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            <Send size={15}/> Submit Assignment
          </button>
        </div>
      </div>
    </Modal>
  );
}
