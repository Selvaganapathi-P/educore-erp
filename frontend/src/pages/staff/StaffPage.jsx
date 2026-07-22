import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
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
import { Avatar } from '../students/StudentsPage';

const STATUS_BADGE = { active:'badge-success', on_leave:'badge-warning', suspended:'badge-danger', relieved:'badge-slate', retired:'badge-info' };
const EMP_TYPE_BADGE = { permanent:'badge-success', contractual:'badge-warning', part_time:'badge-info', visiting:'badge-slate', probation:'badge-primary' };

export default function StaffPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [dept, setDept]     = useState('');
  const [status, setStatus] = useState('');
  const [delTarget, setDel] = useState(null);
  const dSearch = useDebounce(search);

  const { data: statsData } = useQuery({
    queryKey: ['staff-stats'],
    queryFn:  () => api.get('/staff/stats').then(r => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['staff', page, dSearch, dept, status],
    queryFn:  () => api.get('/staff', {
      params: { page, limit: 25, search: dSearch||undefined, department: dept||undefined, status: status||undefined },
    }).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: id => api.delete(`/staff/${id}`),
    onSuccess:  () => { toast.success('Staff profile removed'); setDel(null); qc.invalidateQueries(['staff']); qc.invalidateQueries(['staff-stats']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Delete failed'),
  });

  const staff = data?.data ?? [];
  const meta  = data?.meta ?? null;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">{statsData?.total ?? '—'} total staff members</p>
        </div>
        <Link to="/staff/new" className="btn btn-primary btn-md">
          <Plus size={16}/> Add Staff
        </Link>
      </div>

      {/* Department chips */}
      {statsData?.byDept?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setDept(''); setPage(1); }}
            className={clsx('px-3 py-1 rounded-full text-xs font-medium border transition-all',
              !dept ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
            All ({statsData.total})
          </button>
          {statsData.byDept.slice(0,8).map(d => (
            <button key={d._id} onClick={() => { setDept(d._id); setPage(1); }}
              className={clsx('px-3 py-1 rounded-full text-xs font-medium border transition-all',
                dept === d._id ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
              {d._id} ({d.count})
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card card-body flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input className="input pl-9 w-full" placeholder="Search name, employee ID, department…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {['active','on_leave','suspended','relieved','retired'].map(s =>
            <option key={s} value={s} className="capitalize">{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Type</th>
                <th>Joined</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({length:8}).map((_,i)=>(
                    <tr key={i}>{Array.from({length:8}).map((_,j)=>(
                      <td key={j}><div className="skeleton h-4 rounded w-24"/></td>))}</tr>))
                : staff.length === 0
                  ? <tr><td colSpan={8}><EmptyState icon={Users} title="No staff found"/></td></tr>
                  : staff.map(s => {
                      const fullName = `${s.user?.profile?.firstName ?? ''} ${s.user?.profile?.lastName ?? ''}`.trim();
                      return (
                        <tr key={s._id}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={fullName}/>
                              <div>
                                <p className="font-medium text-slate-800">{fullName}</p>
                                <p className="text-xs text-slate-400">{s.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono text-sm text-slate-600">{s.employeeId}</td>
                          <td className="text-slate-600">{s.department}</td>
                          <td className="text-slate-600">{s.designation}</td>
                          <td><span className={`badge ${EMP_TYPE_BADGE[s.employmentType] ?? 'badge-slate'} capitalize`}>{s.employmentType?.replace(/_/g,' ')}</span></td>
                          <td className="text-slate-500 text-sm tabular-nums">{dayjs(s.joiningDate).format('DD MMM YYYY')}</td>
                          <td><span className={`badge ${STATUS_BADGE[s.status] ?? 'badge-slate'} capitalize`}>{s.status?.replace(/_/g,' ')}</span></td>
                          <td>
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="btn btn-icon btn-ghost"><MoreVertical size={16}/></button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content align="end" sideOffset={4}
                                  className="z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-sm">
                                  <DropdownMenu.Item asChild>
                                    <Link to={`/staff/${s._id}`}
                                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer">
                                      <Eye size={14}/> View Profile
                                    </Link>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item asChild>
                                    <Link to={`/staff/${s._id}/edit`}
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
          <Pagination meta={meta} onPageChange={setPage}/>
        </div>
      </div>

      <ConfirmDialog
        open={!!delTarget} onClose={() => setDel(null)}
        onConfirm={() => deleteMut.mutate(delTarget._id)} loading={deleteMut.isPending}
        danger title="Remove Staff Profile"
        message="Remove this staff profile? The user account will remain." confirmLabel="Remove"/>
    </div>
  );
}
