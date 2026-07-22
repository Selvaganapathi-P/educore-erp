import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ClipboardList, MoreVertical, Eye, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import api from '../../lib/axios';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';

const PIPELINE = [
  { key: 'enquiry',              label: 'Enquiry',            color: 'bg-slate-400'  },
  { key: 'applied',             label: 'Applied',            color: 'bg-blue-400'   },
  { key: 'documents_pending',   label: 'Docs Pending',       color: 'bg-yellow-400' },
  { key: 'under_review',        label: 'Under Review',       color: 'bg-orange-400' },
  { key: 'interview_scheduled', label: 'Interview',          color: 'bg-purple-400' },
  { key: 'approved',            label: 'Approved',           color: 'bg-green-400'  },
  { key: 'waitlisted',          label: 'Waitlisted',         color: 'bg-cyan-400'   },
  { key: 'enrolled',            label: 'Enrolled',           color: 'bg-emerald-500'},
  { key: 'rejected',            label: 'Rejected',           color: 'bg-red-400'    },
];

const STATUS_BADGE = {
  enquiry:              'badge-slate',
  applied:              'badge-primary',
  documents_pending:    'badge-warning',
  under_review:         'badge-warning',
  interview_scheduled:  'badge-info',
  approved:             'badge-success',
  waitlisted:           'badge-info',
  enrolled:             'badge-success',
  rejected:             'badge-danger',
};

export default function AdmissionsPage() {
  const qc = useQueryClient();
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [delTarget, setDel]   = useState(null);
  const dSearch = useDebounce(search);

  const { data: statsData } = useQuery({
    queryKey: ['admission-stats'],
    queryFn:  () => api.get('/admissions/stats').then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admissions', page, dSearch, status],
    queryFn:  () =>
      api.get('/admissions', {
        params: { page, limit: 20, search: dSearch || undefined, status: status || undefined },
      }).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/admissions/${id}`),
    onSuccess:  () => { toast.success('Deleted'); setDel(null); qc.invalidateQueries(['admissions']); qc.invalidateQueries(['admission-stats']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Delete failed'),
  });

  const admissions = data?.data ?? [];
  const meta       = data?.meta ?? null;

  const total = statsData ? Object.values(statsData).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admissions</h1>
          <p className="page-subtitle">Manage the full admission pipeline</p>
        </div>
        <Link to="/admissions/new" className="btn btn-primary btn-md">
          <Plus size={16} /> New Application
        </Link>
      </div>

      {/* Pipeline bar */}
      {statsData && total > 0 && (
        <div className="card card-body">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Pipeline Overview</p>
          <div className="flex rounded-lg overflow-hidden h-3 mb-4">
            {PIPELINE.filter(p => statsData[p.key] > 0).map(p => (
              <div
                key={p.key}
                title={`${p.label}: ${statsData[p.key]}`}
                style={{ width: `${(statsData[p.key] / total) * 100}%` }}
                className={`${p.color} transition-all`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {PIPELINE.map(p => (
              <button
                key={p.key}
                onClick={() => { setStatus(status === p.key ? '' : p.key); setPage(1); }}
                className={clsx(
                  'flex items-center gap-1.5 text-xs transition-opacity',
                  status && status !== p.key ? 'opacity-40' : 'opacity-100',
                )}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                <span className="text-slate-600">{p.label}</span>
                <span className="font-semibold text-slate-800">{statsData[p.key] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9 w-full"
            placeholder="Search name, application no, phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {PIPELINE.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Student</th>
                <th>Class</th>
                <th>Parent Contact</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded w-24" /></td>
                    ))}</tr>
                  ))
                : admissions.length === 0
                  ? <tr><td colSpan={7}><EmptyState icon={ClipboardList} title="No applications yet" description="Create your first admission application." /></td></tr>
                  : admissions.map(a => (
                      <tr key={a._id}>
                        <td className="font-mono text-xs text-slate-500">{a.applicationNo}</td>
                        <td>
                          <p className="font-medium text-slate-800">{a.student.firstName} {a.student.lastName}</p>
                          <p className="text-xs text-slate-400">{a.student.gender} · {dayjs(a.student.dateOfBirth).format('DD MMM YYYY')}</p>
                        </td>
                        <td className="text-slate-600">{a.applyingForClass} <span className="text-slate-400">({a.applyingForYear})</span></td>
                        <td>
                          <p className="text-sm text-slate-700">{a.father?.name || a.mother?.name || a.guardian?.name || '—'}</p>
                          <p className="text-xs text-slate-400">{a.father?.phone || a.mother?.phone || a.guardian?.phone || ''}</p>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[a.status] ?? 'badge-slate'}`}>
                            {PIPELINE.find(p => p.key === a.status)?.label ?? a.status}
                          </span>
                        </td>
                        <td className="text-slate-500 text-sm tabular-nums">{dayjs(a.createdAt).format('DD MMM YY')}</td>
                        <td>
                          <AdmissionActions a={a} onDelete={() => setDel(a)} />
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
        <div className="px-4 border-t border-slate-100">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        open={!!delTarget}
        onClose={() => setDel(null)}
        onConfirm={() => deleteMut.mutate(delTarget._id)}
        loading={deleteMut.isPending}
        danger
        title="Delete Application"
        message={`Delete application for "${delTarget?.student?.firstName} ${delTarget?.student?.lastName}"?`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function AdmissionActions({ a, onDelete }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="btn btn-icon btn-ghost"><MoreVertical size={16} /></button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={4}
          className="z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-sm">
          <DropdownMenu.Item asChild>
            <Link to={`/admissions/${a._id}`}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Eye size={14} /> View Details
            </Link>
          </DropdownMenu.Item>
          {!['enrolled','rejected'].includes(a.status) && (
            <DropdownMenu.Item asChild>
              <Link to={`/admissions/${a._id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Edit2 size={14} /> Edit
              </Link>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="my-1 border-t border-slate-100" />
          <DropdownMenu.Item onClick={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer">
            <Trash2 size={14} /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
