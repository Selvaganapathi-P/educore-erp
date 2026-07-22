import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, UserX, MoreVertical, Edit2, Trash2, UserCheck, Mail } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import api from '../../lib/axios';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { InviteUserModal } from './InviteUserModal';
import { EditUserModal } from './EditUserModal';

const STATUS_BADGE = { active: 'badge-success', inactive: 'badge-slate', suspended: 'badge-danger', pending: 'badge-warning' };
const ROLE_LABELS  = {
  school_admin: 'School Admin', principal: 'Principal', vice_principal: 'Vice Principal',
  teacher: 'Teacher', student: 'Student', parent: 'Parent', hr: 'HR Manager',
  receptionist: 'Receptionist', accountant: 'Accountant', librarian: 'Librarian',
  transport_manager: 'Transport Mgr', hostel_warden: 'Hostel Warden', store_manager: 'Store Mgr',
  nurse: 'Nurse', counselor: 'Counselor', security_guard: 'Security', it_administrator: 'IT Admin',
};

function Avatar({ user }) {
  const initials = `${user.profile?.firstName?.[0] ?? ''}${user.profile?.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [role, setRole]         = useState('');
  const [status, setStatus]     = useState('');
  const [inviteOpen, setInvite] = useState(false);
  const [editTarget, setEdit]   = useState(null);
  const [deleteTarget, setDel]  = useState(null);

  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, dSearch, role, status],
    queryFn:  () =>
      api.get('/users', { params: { page, limit: 20, search: dSearch || undefined, role: role || undefined, status: status || undefined } })
         .then(r => r.data),
  });

  const users = data?.data ?? [];
  const meta  = data?.meta ?? null;

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/users/${id}`),
    onSuccess: () => { toast.success('User removed'); setDel(null); qc.invalidateQueries(['users']); },
    onError:   e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/users/${id}/status`, { status }),
    onSuccess: (_, { status }) => { toast.success(`User ${status}`); qc.invalidateQueries(['users']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all staff, students, and parents</p>
        </div>
        <button onClick={() => setInvite(true)} className="btn btn-primary btn-md">
          <Plus size={16} /> Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9 w-full"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input w-auto" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {['active','inactive','suspended','pending'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded w-28" /></td>
                    ))}</tr>
                  ))
                : users.length === 0
                  ? <tr><td colSpan={6}><EmptyState icon={UserX} title="No users found" description="Invite your first user to get started." /></td></tr>
                  : users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <Avatar user={u} />
                            <div>
                              <p className="font-medium text-slate-800">{u.profile?.firstName} {u.profile?.lastName}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-slate">{ROLE_LABELS[u.role] ?? u.role}</span></td>
                        <td><span className={`badge ${STATUS_BADGE[u.status] ?? 'badge-slate'} capitalize`}>{u.status}</span></td>
                        <td className="text-slate-500 text-sm tabular-nums">{dayjs(u.createdAt).format('DD MMM YY')}</td>
                        <td className="text-slate-500 text-sm tabular-nums">
                          {u.lastLogin ? dayjs(u.lastLogin).fromNow() : '—'}
                        </td>
                        <td>
                          <UserActions
                            user={u}
                            onEdit={() => setEdit(u)}
                            onDelete={() => setDel(u)}
                            onToggleStatus={() => statusMut.mutate({ id: u._id, status: u.status === 'active' ? 'suspended' : 'active' })}
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

      <InviteUserModal open={inviteOpen} onClose={() => setInvite(false)} />
      {editTarget && <EditUserModal user={editTarget} onClose={() => setEdit(null)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDel(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget._id)}
        loading={deleteMut.isPending}
        danger
        title="Remove User"
        message={`Remove "${deleteTarget?.profile?.firstName} ${deleteTarget?.profile?.lastName}"? They will lose access immediately.`}
        confirmLabel="Remove"
      />
    </div>
  );
}

function UserActions({ user, onEdit, onDelete, onToggleStatus }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="btn btn-icon btn-ghost"><MoreVertical size={16} /></button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={4}
          className="z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-sm">
          <DropdownMenu.Item onClick={onEdit}
            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Edit2 size={14} /> Edit Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={onToggleStatus}
            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
            {user.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
            {user.status === 'active' ? 'Suspend' : 'Reactivate'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-slate-100" />
          <DropdownMenu.Item onClick={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer">
            <Trash2 size={14} /> Remove
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
