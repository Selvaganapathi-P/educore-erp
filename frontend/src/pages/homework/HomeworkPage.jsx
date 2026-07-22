import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Plus, MoreVertical, BookOpen, Clock, Users, Send, X } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';

dayjs.extend(relativeTime);

const TYPE_COLOR = {
  homework:   'badge-primary',
  assignment: 'badge-warning',
  project:    'badge-info',
  classwork:  'badge-success',
};

const STATUS_COLOR = {
  draft:     'badge-slate',
  published: 'badge-success',
  closed:    'badge-error',
};

export default function HomeworkPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [page,      setPage]      = useState(1);
  const [classId,   setClassId]   = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [status,    setStatus]    = useState('');
  const [type,      setType]      = useState('');
  const [delTarget, setDel]       = useState(null);

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

  const { data, isLoading } = useQuery({
    queryKey: ['homework', page, classId, subjectId, status, type],
    queryFn:  () => api.get('/homework', { params: { page, limit: 15, classId, subjectId, status, type } }).then(r => r.data),
    keepPreviousData: true,
  });

  const publishMut = useMutation({
    mutationFn: id => api.patch(`/homework/${id}/publish`),
    onSuccess:  () => { toast.success('Published'); qc.invalidateQueries(['homework']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const closeMut = useMutation({
    mutationFn: id => api.patch(`/homework/${id}/close`),
    onSuccess:  () => { toast.success('Closed'); qc.invalidateQueries(['homework']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/homework/${id}`),
    onSuccess:  () => { toast.success('Deleted'); setDel(null); qc.invalidateQueries(['homework']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const homework = data?.data ?? [];
  const total    = data?.total ?? 0;
  const pages    = data?.pages ?? 1;

  function isOverdue(hw) { return hw.status === 'published' && dayjs().isAfter(dayjs(hw.dueDate)); }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Homework & Assignments</h1>
          <p className="page-subtitle">Create and manage assignments for your classes</p>
        </div>
        <button onClick={() => navigate('/homework/new')} className="btn btn-primary btn-md">
          <Plus size={16}/> Create Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Class</label>
          <select className="input w-36" value={classId} onChange={e => { setClassId(e.target.value); setPage(1); }}>
            <option value="">All classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Subject</label>
          <select className="input w-36" value={subjectId} onChange={e => { setSubjectId(e.target.value); setPage(1); }}>
            <option value="">All subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input w-32" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {['draft','published','closed'].map(s=><option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input w-32" value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
            <option value="">All types</option>
            {['homework','assignment','project','classwork'].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        {(classId || subjectId || status || type) && (
          <button onClick={() => { setClassId(''); setSubjectId(''); setStatus(''); setType(''); setPage(1); }}
            className="btn btn-ghost btn-sm text-slate-500 mb-0.5"><X size={14}/> Clear</button>
        )}
      </div>

      {/* List */}
      {isLoading
        ? <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-24 rounded-xl"/>)}</div>
        : homework.length === 0
          ? <div className="card card-body"><EmptyState icon={BookOpen} title="No assignments yet" description="Create your first homework or assignment."/></div>
          : (
            <div className="space-y-3">
              {homework.map(hw => (
                <div key={hw._id} className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/homework/${hw._id}`)}>
                  <div className="flex items-stretch">
                    {/* Color accent */}
                    <div className="w-1 shrink-0" style={{ background: hw.subjectId?.color ?? '#94a3b8' }}/>
                    <div className="flex-1 card-body">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`badge ${TYPE_COLOR[hw.type] ?? 'badge-slate'} capitalize`}>{hw.type}</span>
                            <span className={`badge ${STATUS_COLOR[hw.status]} capitalize`}>{hw.status}</span>
                            {isOverdue(hw) && <span className="badge badge-error">Overdue</span>}
                          </div>
                          <h3 className="font-semibold text-slate-800 text-sm">{hw.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            {hw.subjectId && <span style={{ color: hw.subjectId.color }}>{hw.subjectId.name}</span>}
                            <span>{hw.classId?.name}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={11}/>
                              Due {dayjs(hw.dueDate).format('DD MMM YYYY')}
                            </span>
                            <span>Max: {hw.maxMarks} marks</span>
                          </div>
                        </div>
                        {/* Submission count */}
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-lg font-bold text-slate-700">{hw._submissionCount?.submitted ?? 0}</p>
                          <p className="text-xs text-slate-400">submitted</p>
                          {(hw._submissionCount?.graded ?? 0) > 0 && (
                            <p className="text-xs text-emerald-500">{hw._submissionCount.graded} graded</p>
                          )}
                        </div>
                        {/* Actions */}
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild onClick={e => e.stopPropagation()}>
                            <button className="btn btn-icon btn-ghost shrink-0"><MoreVertical size={16}/></button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="dropdown-content" align="end" onClick={e => e.stopPropagation()}>
                              <DropdownMenu.Item className="dropdown-item" onClick={() => navigate(`/homework/${hw._id}`)}>View</DropdownMenu.Item>
                              {hw.status !== 'closed' && (
                                <DropdownMenu.Item className="dropdown-item" onClick={() => navigate(`/homework/${hw._id}/edit`)}>Edit</DropdownMenu.Item>
                              )}
                              {hw.status === 'draft' && (
                                <DropdownMenu.Item className="dropdown-item" onClick={() => publishMut.mutate(hw._id)}>Publish</DropdownMenu.Item>
                              )}
                              {hw.status === 'published' && (
                                <DropdownMenu.Item className="dropdown-item" onClick={() => closeMut.mutate(hw._id)}>Close</DropdownMenu.Item>
                              )}
                              <DropdownMenu.Separator className="dropdown-separator"/>
                              <DropdownMenu.Item className="dropdown-item text-red-500" onClick={() => setDel(hw)}>Delete</DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {pages > 1 && <Pagination page={page} pages={pages} total={total} onPageChange={setPage}/>}

      <ConfirmDialog open={!!delTarget} onClose={() => setDel(null)}
        onConfirm={() => deleteMut.mutate(delTarget._id)} loading={deleteMut.isPending}
        danger title="Delete Assignment" message={`Delete "${delTarget?.title}"?`} confirmLabel="Delete"/>
    </div>
  );
}
