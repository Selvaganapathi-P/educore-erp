import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, MoreVertical, Eye, Edit2, Trash2, Download } from 'lucide-react';
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

const STATUS_BADGE = {
  active:      'badge-success',
  transferred: 'badge-info',
  left:        'badge-slate',
  alumni:      'badge-warning',
  deceased:    'badge-danger',
};

function Avatar({ name = '?', size = 'sm' }) {
  const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

export { Avatar };

export default function StudentsPage() {
  const qc = useQueryClient();
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [cls, setCls]         = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus]   = useState('');
  const [delTarget, setDel]   = useState(null);
  const dSearch = useDebounce(search);

  const { data: statsData } = useQuery({
    queryKey: ['student-stats'],
    queryFn:  () => api.get('/students/stats').then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, dSearch, cls, section, status],
    queryFn:  () => api.get('/students', {
      params: { page, limit: 25, search: dSearch||undefined, class: cls||undefined, section: section||undefined, status: status||undefined },
    }).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/students/${id}`),
    onSuccess:  () => { toast.success('Student removed'); setDel(null); qc.invalidateQueries(['students']); qc.invalidateQueries(['student-stats']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Delete failed'),
  });

  const students = data?.data ?? [];
  const meta     = data?.meta ?? null;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{statsData?.total ?? '—'} total students enrolled</p>
        </div>
        <Link to="/students/new" className="btn btn-primary btn-md">
          <Plus size={16} /> Add Student
        </Link>
      </div>

      {/* Class breakdown chips */}
      {statsData?.byClass?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setCls(''); setPage(1); }}
            className={clsx('px-3 py-1 rounded-full text-xs font-medium border transition-all',
              !cls ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
            All ({statsData.total})
          </button>
          {statsData.byClass.map(c => (
            <button key={c._id} onClick={() => { setCls(c._id); setPage(1); }}
              className={clsx('px-3 py-1 rounded-full text-xs font-medium border transition-all',
                cls === c._id ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
              {c._id} ({c.count})
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 w-full" placeholder="Search name, roll no, email…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <input className="input w-28" placeholder="Section" value={section}
          onChange={e => { setSection(e.target.value); setPage(1); }} />
        <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {['active','transferred','left','alumni'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <button className="btn btn-outline btn-sm ml-auto gap-1.5" title="Export CSV">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Fee Cat.</th>
                <th>Status</th>
                <th>Transport</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({length:8}).map((_,i)=>(
                    <tr key={i}>{Array.from({length:7}).map((_,j)=>(
                      <td key={j}><div className="skeleton h-4 rounded w-24"/></td>))}</tr>))
                : students.length === 0
                  ? <tr><td colSpan={7}><EmptyState icon={Users} title="No students found" /></td></tr>
                  : students.map(s => {
                      const fullName = `${s.user?.profile?.firstName ?? ''} ${s.user?.profile?.lastName ?? ''}`.trim();
                      return (
                        <tr key={s._id}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={fullName} />
                              <div>
                                <p className="font-medium text-slate-800">{fullName}</p>
                                <p className="text-xs text-slate-400">{s.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono text-sm text-slate-600">{s.rollNumber}</td>
                          <td className="text-slate-600">{s.class} <span className="text-slate-400">– {s.section}</span></td>
                          <td><span className="badge badge-slate capitalize">{s.feeCategory?.replace(/_/g,' ')}</span></td>
                          <td><span className={`badge ${STATUS_BADGE[s.status] ?? 'badge-slate'} capitalize`}>{s.status}</span></td>
                          <td>
                            {s.transport?.enrolled
                              ? <span className="badge badge-info">Bus</span>
                              : <span className="text-slate-300 text-xs">—</span>}
                          </td>
                          <td>
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="btn btn-icon btn-ghost"><MoreVertical size={16}/></button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content align="end" sideOffset={4}
                                  className="z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-sm">
                                  <DropdownMenu.Item asChild>
                                    <Link to={`/students/${s._id}`}
                                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
                                      <Eye size={14}/> View Profile
                                    </Link>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item asChild>
                                    <Link to={`/students/${s._id}/edit`}
                                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
                                      <Edit2 size={14}/> Edit
                                    </Link>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Separator className="my-1 border-t border-slate-100"/>
                                  <DropdownMenu.Item onClick={() => setDel(s)}
                                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer">
                                    <Trash2 size={14}/> Remove
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </td>
                        </tr>
                      );
                    })
              }
            </tbody>
          </table>
        </div>
        <div className="px-4 border-t border-slate-100">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        open={!!delTarget} onClose={() => setDel(null)}
        onConfirm={() => deleteMut.mutate(delTarget._id)} loading={deleteMut.isPending}
        danger title="Remove Student"
        message={`Remove student profile? The user account will remain but the extended profile will be deleted.`}
        confirmLabel="Remove" />
    </div>
  );
}
