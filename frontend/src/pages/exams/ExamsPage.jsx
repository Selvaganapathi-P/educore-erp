import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Plus, FileText, MoreVertical, Calendar, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const TYPE_LABEL = { unit_test:'Unit Test', mid_term:'Mid Term', final:'Final', quarterly:'Quarterly', half_yearly:'Half Yearly', annual:'Annual', mock:'Mock', pre_board:'Pre-Board' };
const TYPE_COLOR = { unit_test:'badge-slate', mid_term:'badge-primary', final:'badge-error', quarterly:'badge-warning', half_yearly:'badge-info', annual:'badge-success', mock:'badge-slate', pre_board:'badge-warning' };
const STATUS_COLOR = { draft:'badge-slate', published:'badge-primary', ongoing:'badge-warning', completed:'badge-info', results_published:'badge-success' };

export default function ExamsPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const [typeFilter,   setType]   = useState('');
  const [statusFilter, setStatus] = useState('');
  const [delTarget, setDel]       = useState(null);

  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data) });
  const currentYear = years.find(y => y.isCurrent);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams', typeFilter, statusFilter, currentYear?._id],
    queryFn:  () => api.get('/exams', { params: { academicYearId: currentYear?._id, type: typeFilter, status: statusFilter } }).then(r => r.data.data),
    enabled:  !!currentYear?._id,
  });

  const publishMut = useMutation({
    mutationFn: id => api.patch(`/exams/${id}/publish`),
    onSuccess:  () => { toast.success('Exam published'); qc.invalidateQueries(['exams']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const completeMut = useMutation({
    mutationFn: id => api.patch(`/exams/${id}/complete`),
    onSuccess:  () => { toast.success('Marked completed'); qc.invalidateQueries(['exams']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/exams/${id}`),
    onSuccess:  () => { toast.success('Deleted'); setDel(null); qc.invalidateQueries(['exams']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Examinations</h1>
          <p className="page-subtitle">Schedule exams, enter marks, publish results</p>
        </div>
        <button onClick={() => navigate('/exams/new')} className="btn btn-primary btn-md">
          <Plus size={16}/> Create Exam
        </button>
      </div>

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Type</label>
          <select className="input w-36" value={typeFilter} onChange={e => setType(e.target.value)}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input w-36" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {['draft','published','ongoing','completed','results_published'].map(s=>(
              <option key={s} value={s} className="capitalize">{s.replace(/_/g,' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam cards */}
      {isLoading
        ? <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-20 rounded-xl"/>)}</div>
        : exams.length === 0
          ? <div className="card card-body"><EmptyState icon={FileText} title="No exams yet" description="Create your first exam to get started."/></div>
          : (
            <div className="space-y-3">
              {exams.map(exam => (
                <div key={exam._id} className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/exams/${exam._id}`)}>
                  <div className="card-body flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <FileText size={20}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-semibold text-slate-800">{exam.name}</h3>
                        <span className={`badge ${TYPE_COLOR[exam.type] ?? 'badge-slate'}`}>{TYPE_LABEL[exam.type] ?? exam.type}</span>
                        <span className={`badge ${STATUS_COLOR[exam.status]} capitalize`}>{exam.status.replace(/_/g,' ')}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Calendar size={11}/>
                        {dayjs(exam.startDate).format('DD MMM')} – {dayjs(exam.endDate).format('DD MMM YYYY')}
                        <span>·</span>
                        {exam.academicYearId?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild onClick={e => e.stopPropagation()}>
                          <button className="btn btn-icon btn-ghost"><MoreVertical size={16}/></button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="dropdown-content" align="end" onClick={e => e.stopPropagation()}>
                            <DropdownMenu.Item className="dropdown-item" onClick={() => navigate(`/exams/${exam._id}`)}>View & Schedule</DropdownMenu.Item>
                            <DropdownMenu.Item className="dropdown-item" onClick={() => navigate(`/exams/${exam._id}/marks`)}>Enter Marks</DropdownMenu.Item>
                            <DropdownMenu.Item className="dropdown-item" onClick={() => navigate(`/exams/${exam._id}/results`)}>View Results</DropdownMenu.Item>
                            <DropdownMenu.Separator className="dropdown-separator"/>
                            {exam.status === 'draft' && (
                              <DropdownMenu.Item className="dropdown-item" onClick={() => publishMut.mutate(exam._id)}>Publish</DropdownMenu.Item>
                            )}
                            {exam.status === 'ongoing' && (
                              <DropdownMenu.Item className="dropdown-item" onClick={() => completeMut.mutate(exam._id)}>Mark Completed</DropdownMenu.Item>
                            )}
                            <DropdownMenu.Separator className="dropdown-separator"/>
                            <DropdownMenu.Item className="dropdown-item text-red-500" onClick={() => setDel(exam)}>Delete</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                      <ChevronRight size={16} className="text-slate-300"/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <ConfirmDialog open={!!delTarget} onClose={() => setDel(null)}
        onConfirm={() => deleteMut.mutate(delTarget._id)} loading={deleteMut.isPending}
        danger title="Delete Exam" message={`Delete "${delTarget?.name}"?`} confirmLabel="Delete"/>
    </div>
  );
}
