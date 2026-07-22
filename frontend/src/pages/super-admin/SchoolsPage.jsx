import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Building2, MoreVertical, Edit2, Trash2, Power, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import api from '../../lib/axios';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';

const STATUS_BADGE = {
  active:    'badge-success',
  trial:     'badge-primary',
  inactive:  'badge-slate',
  suspended: 'badge-danger',
};

const PLAN_BADGE = {
  free:       'badge-slate',
  basic:      'badge-info',
  standard:   'badge-primary',
  premium:    'badge-warning',
  enterprise: 'badge-success',
};

export default function SchoolsPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);

  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['schools', page, dSearch, status],
    queryFn:  () =>
      api.get('/schools', { params: { page, limit: 15, search: dSearch || undefined, status: status || undefined } })
         .then(r => r.data),
  });

  const schools = data?.data ?? [];
  const meta    = data?.meta ?? null;

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/schools/${id}`),
    onSuccess: () => {
      toast.success('School deleted');
      setDeleteTarget(null);
      qc.invalidateQueries(['schools']);
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Delete failed'),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/schools/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      toast.success(`School ${status}`);
      setSuspendTarget(null);
      qc.invalidateQueries(['schools']);
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schools</h1>
          <p className="page-subtitle">Manage all schools on the platform</p>
        </div>
        <Link to="/super-admin/schools/new" className="btn btn-primary btn-md">
          <Plus size={16} /> Add School
        </Link>
      </div>

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9 w-full"
            placeholder="Search schools…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {['active','trial','inactive','suspended'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>School</th>
                <th>Type</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded w-24" /></td>
                    ))}</tr>
                  ))
                : schools.length === 0
                  ? <tr><td colSpan={6}><EmptyState icon={Building2} title="No schools found" description="Add your first school to get started." /></td></tr>
                  : schools.map(school => (
                      <tr key={school._id}>
                        <td>
                          <p className="font-medium text-slate-800">{school.name}</p>
                          <p className="text-xs text-slate-400">{school.email}</p>
                        </td>
                        <td className="text-slate-500 capitalize">{school.type?.replace(/_/g,' ')}</td>
                        <td>
                          <span className={`badge ${PLAN_BADGE[school.subscriptionPlan] ?? 'badge-slate'} capitalize`}>
                            {school.subscriptionPlan}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[school.status] ?? 'badge-slate'} capitalize`}>
                            {school.status}
                          </span>
                        </td>
                        <td className="text-slate-500 text-sm tabular-nums">
                          {dayjs(school.createdAt).format('DD MMM YYYY')}
                        </td>
                        <td>
                          <SchoolActions
                            school={school}
                            onDelete={() => setDeleteTarget(school)}
                            onSuspend={() => setSuspendTarget(school)}
                          />
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

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget._id)}
        loading={deleteMut.isPending}
        danger
        title="Delete School"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />

      {/* Suspend confirm */}
      <ConfirmDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={() => statusMut.mutate({ id: suspendTarget._id, status: suspendTarget.status === 'suspended' ? 'active' : 'suspended' })}
        loading={statusMut.isPending}
        danger={suspendTarget?.status !== 'suspended'}
        title={suspendTarget?.status === 'suspended' ? 'Reactivate School' : 'Suspend School'}
        message={
          suspendTarget?.status === 'suspended'
            ? `Reactivate "${suspendTarget?.name}"?`
            : `Suspend "${suspendTarget?.name}"? Users won't be able to log in.`
        }
        confirmLabel={suspendTarget?.status === 'suspended' ? 'Reactivate' : 'Suspend'}
      />
    </div>
  );
}

function SchoolActions({ school, onDelete, onSuspend }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="btn btn-icon btn-ghost">
          <MoreVertical size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-sm"
        >
          <DropdownMenu.Item asChild>
            <Link to={`/super-admin/schools/${school._id}`}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Eye size={14} /> View Details
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link to={`/super-admin/schools/${school._id}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Edit2 size={14} /> Edit
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={onSuspend}
            className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:bg-orange-50 cursor-pointer"
          >
            <Power size={14} /> {school.status === 'suspended' ? 'Reactivate' : 'Suspend'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-slate-100" />
          <DropdownMenu.Item
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 size={14} /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
