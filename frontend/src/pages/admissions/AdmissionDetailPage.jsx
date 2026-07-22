import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, UserCheck, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../lib/axios';
import { StatusModal } from './StatusModal';

const PIPELINE = [
  { key: 'enquiry',              label: 'Enquiry'     },
  { key: 'applied',             label: 'Applied'     },
  { key: 'documents_pending',   label: 'Docs Pending'},
  { key: 'under_review',        label: 'Under Review'},
  { key: 'interview_scheduled', label: 'Interview'   },
  { key: 'approved',            label: 'Approved'    },
  { key: 'waitlisted',          label: 'Waitlisted'  },
  { key: 'enrolled',            label: 'Enrolled'    },
  { key: 'rejected',            label: 'Rejected'    },
];

const NEXT_ACTIONS = {
  enquiry:              ['applied','rejected'],
  applied:              ['documents_pending','under_review','rejected'],
  documents_pending:    ['under_review','rejected'],
  under_review:         ['interview_scheduled','approved','waitlisted','rejected'],
  interview_scheduled:  ['approved','waitlisted','rejected'],
  approved:             ['enrolled'],
  waitlisted:           ['approved','rejected'],
};

export default function AdmissionDetailPage() {
  const { id } = useParams();
  const nav    = useNavigate();
  const qc     = useQueryClient();
  const [statusModal, setStatusModal] = useState(null);

  const { data: a, isLoading } = useQuery({
    queryKey: ['admission', id],
    queryFn:  () => api.get(`/admissions/${id}`).then(r => r.data.data),
  });

  const enrollMut = useMutation({
    mutationFn: () => api.post(`/admissions/${id}/enroll`),
    onSuccess:  () => { toast.success('Student enrolled!'); qc.invalidateQueries(['admission', id]); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Enroll failed'),
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {Array.from({length:4}).map((_,i)=><div key={i} className="card card-body"><div className="skeleton h-20 rounded"/></div>)}
    </div>
  );
  if (!a) return null;

  const nextActions = NEXT_ACTIONS[a.status] ?? [];
  const isFinal    = ['enrolled','rejected'].includes(a.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header flex-wrap gap-3">
        <div>
          <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-1">
            <ArrowLeft size={14} /> Admissions
          </button>
          <h1 className="page-title">{a.student.firstName} {a.student.lastName}</h1>
          <p className="page-subtitle font-mono">{a.applicationNo}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!isFinal && (
            <Link to={`/admissions/${id}/edit`} className="btn btn-outline btn-md">
              <Edit2 size={15} /> Edit
            </Link>
          )}
          {nextActions.filter(s => s !== 'enrolled').map(s => (
            <button key={s} onClick={() => setStatusModal(s)}
              className={clsx('btn btn-md', s === 'rejected' ? 'btn-danger' : 'btn-primary')}>
              {s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
          {a.status === 'approved' && !a.enrolledStudentId && (
            <button onClick={() => enrollMut.mutate()} disabled={enrollMut.isPending}
              className="btn btn-success btn-md">
              {enrollMut.isPending
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <UserCheck size={15}/>
              }
              Enroll Student
            </button>
          )}
        </div>
      </div>

      {/* Pipeline stepper */}
      <div className="card card-body">
        <div className="flex items-center gap-0">
          {['enquiry','applied','documents_pending','under_review','interview_scheduled','approved','enrolled'].map((s, i, arr) => {
            const idx     = arr.indexOf(a.status);
            const isActive = s === a.status;
            const isDone   = i < idx || (a.status === 'enrolled' && s !== 'enrolled');
            const label    = PIPELINE.find(p => p.key === s)?.label ?? s;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    isDone   ? 'bg-green-500 text-white'  :
                    isActive ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                              'bg-slate-200 text-slate-400'
                  )}>
                    {isDone ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-center hidden sm:block w-14 leading-tight">{label}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className={clsx('flex-1 h-0.5 mx-0.5', isDone ? 'bg-green-400' : 'bg-slate-200')} />
                )}
              </div>
            );
          })}
          {a.status === 'rejected' && (
            <div className="ml-3 flex items-center gap-1 text-red-600 text-sm font-medium">
              <XCircle size={16} /> Rejected
            </div>
          )}
          {a.status === 'waitlisted' && (
            <div className="ml-3 flex items-center gap-1 text-cyan-600 text-sm font-medium">
              <Clock size={16} /> Waitlisted #{a.waitlistPosition ?? '—'}
            </div>
          )}
        </div>
      </div>

      {/* Rejection notice */}
      {a.status === 'rejected' && a.rejectionReason && (
        <div className="alert alert-danger flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span><strong>Rejection reason:</strong> {a.rejectionReason}</span>
        </div>
      )}

      {/* Enrolled notice */}
      {a.enrolledStudentId && (
        <div className="alert alert-success flex gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>Student enrolled — User ID: <strong>{a.enrolledStudentId._id ?? a.enrolledStudentId}</strong></span>
        </div>
      )}

      {/* Main info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student */}
        <div className="card card-body space-y-3">
          <h2 className="font-semibold text-slate-700">Student Information</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Date of Birth" value={dayjs(a.student.dateOfBirth).format('DD MMMM YYYY')} />
            <Row label="Gender"        value={a.student.gender} className="capitalize" />
            <Row label="Category"      value={a.student.category?.toUpperCase()} />
            <Row label="Blood Group"   value={a.student.bloodGroup  ?? '—'} />
            <Row label="Nationality"   value={a.student.nationality ?? '—'} />
            <Row label="Mother Tongue" value={a.student.motherTongue ?? '—'} />
          </dl>
        </div>

        {/* Academic */}
        <div className="card card-body space-y-3">
          <h2 className="font-semibold text-slate-700">Academic Details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Applying For"  value={`${a.applyingForClass} (${a.applyingForYear})`} />
            <Row label="Prev School"   value={a.previousSchool?.name     ?? '—'} />
            <Row label="Prev Class"    value={a.previousSchool?.class    ?? '—'} />
            <Row label="Board"         value={a.previousSchool?.board    ?? '—'} />
            <Row label="Percentage"    value={a.previousSchool?.percentage != null ? `${a.previousSchool.percentage}%` : '—'} />
            <Row label="Source"        value={a.source?.replace(/_/g,' ')} className="capitalize" />
          </dl>
        </div>

        {/* Father */}
        {a.father?.name && (
          <div className="card card-body space-y-3">
            <h2 className="font-semibold text-slate-700">Father</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Name"       value={a.father.name} />
              <Row label="Phone"      value={a.father.phone      ?? '—'} />
              <Row label="Email"      value={a.father.email      ?? '—'} />
              <Row label="Occupation" value={a.father.occupation ?? '—'} />
            </dl>
          </div>
        )}

        {/* Mother */}
        {a.mother?.name && (
          <div className="card card-body space-y-3">
            <h2 className="font-semibold text-slate-700">Mother</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Name"       value={a.mother.name} />
              <Row label="Phone"      value={a.mother.phone      ?? '—'} />
              <Row label="Email"      value={a.mother.email      ?? '—'} />
              <Row label="Occupation" value={a.mother.occupation ?? '—'} />
            </dl>
          </div>
        )}
      </div>

      {/* Status history */}
      <div className="card card-body">
        <h2 className="font-semibold text-slate-700 mb-3">Status Timeline</h2>
        <ol className="space-y-3">
          {[...a.statusHistory].reverse().map((h, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700 capitalize">{h.status?.replace(/_/g,' ')}</p>
                {h.note && <p className="text-xs text-slate-500">{h.note}</p>}
                <p className="text-xs text-slate-400">
                  {h.changedBy?.profile?.firstName ? `${h.changedBy.profile.firstName} ${h.changedBy.profile.lastName} · ` : ''}
                  {dayjs(h.changedAt).format('DD MMM YYYY, h:mm A')}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {statusModal && (
        <StatusModal
          applicationId={id}
          targetStatus={statusModal}
          currentStatus={a.status}
          onClose={() => setStatusModal(null)}
        />
      )}
    </div>
  );
}

function Row({ label, value, className = '' }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500 shrink-0">{label}</dt>
      <dd className={`font-medium text-slate-800 text-right ${className}`}>{value}</dd>
    </div>
  );
}
