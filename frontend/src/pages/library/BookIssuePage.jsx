import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, BookOpen, UserCheck, RotateCcw, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const STATUS_COLOR = {
  issued:   'badge-primary',
  returned: 'badge-success',
  overdue:  'badge-error',
  lost:     'badge-error',
  renewed:  'badge-warning',
};

function fmt(n) { return '₹' + Number(n ?? 0).toLocaleString('en-IN'); }

// ── Issue Modal ───────────────────────────────────────────────────────────────
function IssueModal({ open, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: { bookId: '', memberId: '', memberModel: 'Student', dueDate: dayjs().add(14,'day').format('YYYY-MM-DD'), notes: '' },
  });

  const [bookSearch,   setBookSearch]   = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selBook,   setSelBook]   = useState(null);
  const [selMember, setSelMember] = useState(null);

  const memberType = watch('memberModel');

  const { data: books = [] } = useQuery({
    queryKey: ['book-search', bookSearch],
    queryFn:  () => bookSearch.length >= 2
      ? api.get('/library/books', { params: { search: bookSearch, available: 'true', limit: 8 } }).then(r => r.data.data)
      : [],
    staleTime: 15_000,
    enabled: bookSearch.length >= 2,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['member-search', memberSearch, memberType],
    queryFn:  () => memberSearch.length >= 2
      ? api.get('/library/members/search', { params: { search: memberSearch, type: memberType } }).then(r => r.data.data)
      : [],
    staleTime: 15_000,
    enabled: memberSearch.length >= 2,
  });

  const mutation = useMutation({
    mutationFn: (body) => api.post('/library/issues', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-books'] });
      qc.invalidateQueries({ queryKey: ['library-issues'] });
      toast.success('Book issued successfully');
      onClose();
      reset(); setSelBook(null); setSelMember(null); setBookSearch(''); setMemberSearch('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const memberName = (m) => {
    const p = m.userId?.profile;
    return p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : m.rollNumber ?? m.employeeId ?? '';
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Issue Book</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">

            {/* Member type toggle */}
            <div className="form-group">
              <label className="form-label">Member Type</label>
              <div className="flex gap-2">
                {['Student','Staff'].map(t => (
                  <button key={t} type="button"
                    onClick={() => { setValue('memberModel', t); setSelMember(null); setMemberSearch(''); }}
                    className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${memberType === t ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-primary-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('memberModel')}/>
            </div>

            {/* Member search */}
            <div className="form-group">
              <label className="form-label">Member *</label>
              {selMember
                ? (
                  <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                    <UserCheck size={14} className="text-primary-600"/>
                    <span className="text-sm font-medium flex-1">{memberName(selMember)}</span>
                    <span className="text-xs text-slate-400 capitalize">{selMember._memberModel}</span>
                    <button type="button" onClick={() => { setSelMember(null); setValue('memberId',''); }} className="btn-icon text-slate-400"><X size={12}/></button>
                  </div>
                )
                : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="form-input pl-8" placeholder={`Search ${memberType} by roll/employee ID…`}/>
                    {members.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        {members.map(m => (
                          <button key={m._id} type="button"
                            onClick={() => { setSelMember(m); setValue('memberId', m._id); setMemberSearch(''); }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center font-bold shrink-0">
                              {memberName(m)[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{memberName(m)}</p>
                              <p className="text-xs text-slate-400">{m.rollNumber ?? m.employeeId} · {m.currentClass?.name ?? m.designation}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              <input type="hidden" {...register('memberId', { required: true })}/>
              {errors.memberId && <p className="form-error">Select a member</p>}
            </div>

            {/* Book search */}
            <div className="form-group">
              <label className="form-label">Book *</label>
              {selBook
                ? (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
                    <BookOpen size={14} className="text-emerald-600"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{selBook.title}</p>
                      <p className="text-xs text-slate-400">{selBook.author} · {selBook.availableCopies} copies available</p>
                    </div>
                    <button type="button" onClick={() => { setSelBook(null); setValue('bookId',''); }} className="btn-icon text-slate-400"><X size={12}/></button>
                  </div>
                )
                : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={bookSearch} onChange={e => setBookSearch(e.target.value)} className="form-input pl-8" placeholder="Search available books…"/>
                    {books.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        {books.map(b => (
                          <button key={b._id} type="button"
                            onClick={() => { setSelBook(b); setValue('bookId', b._id); setBookSearch(''); }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left">
                            <BookOpen size={14} className="text-slate-400 shrink-0"/>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{b.title}</p>
                              <p className="text-xs text-slate-400">{b.author}</p>
                            </div>
                            <span className="text-xs font-medium text-emerald-600 shrink-0">{b.availableCopies} avail.</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              <input type="hidden" {...register('bookId', { required: true })}/>
              {errors.bookId && <p className="form-error">Select a book</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" {...register('dueDate')} className="form-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input {...register('notes')} className="form-input" placeholder="Optional remarks"/>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Issuing…' : 'Issue Book'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Return Modal ──────────────────────────────────────────────────────────────
function ReturnModal({ open, onClose, issue }) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm({ defaultValues: { finePaid: false, notes: '' } });

  const overdueDays = issue ? Math.max(0, dayjs().diff(dayjs(issue.dueDate), 'day')) : 0;
  const accruedFine = overdueDays * (issue?.finePerDay ?? 1);

  const mutation = useMutation({
    mutationFn: (body) => api.patch(`/library/issues/${issue._id}/return`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-issues'] });
      qc.invalidateQueries({ queryKey: ['library-books'] });
      toast.success('Book returned');
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  if (!issue) return null;

  const name = issue.userId ? `${issue.userId.profile?.firstName ?? ''} ${issue.userId.profile?.lastName ?? ''}`.trim() : '—';

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-md">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Return Book</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(d => mutation.mutate({ ...d, finePaid: Boolean(d.finePaid) }))} className="dialog-body space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Book</span><span className="font-medium text-right max-w-[60%] line-clamp-1">{issue.bookId?.title}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Member</span><span>{name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Issue Date</span><span>{dayjs(issue.issueDate).format('DD MMM YYYY')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Due Date</span><span className={overdueDays > 0 ? 'text-red-600 font-medium' : ''}>{dayjs(issue.dueDate).format('DD MMM YYYY')}</span></div>
            </div>

            {accruedFine > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                <AlertTriangle size={16} className="text-red-500 shrink-0"/>
                <div>
                  <p className="text-sm font-semibold text-red-700">{overdueDays} day{overdueDays !== 1 ? 's' : ''} overdue — Fine: {fmt(accruedFine)}</p>
                  <label className="flex items-center gap-2 text-sm text-red-600 cursor-pointer mt-1">
                    <input type="checkbox" {...register('finePaid')} className="form-checkbox"/> Fine collected
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notes</label>
              <input {...register('notes')} className="form-input" placeholder="Condition, remarks…"/>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                <CheckCircle2 size={14}/> {mutation.isPending ? 'Processing…' : 'Confirm Return'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BookIssuePage() {
  const [issueOpen,   setIssueOpen]   = useState(false);
  const [returnIssue, setReturnIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState('issued,overdue,renewed');

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['library-issues', statusFilter],
    queryFn:  () => api.get('/library/issues', { params: { status: statusFilter, limit: 50 } }).then(r => r.data),
    staleTime: 30_000,
  });

  const renewMut = useMutation({
    mutationFn: (id) => api.patch(`/library/issues/${id}/renew`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['library-issues'] }); toast.success('Renewed 14 days'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const issues = data?.data ?? [];

  const tabs = [
    { key: 'issued,overdue,renewed', label: 'Active' },
    { key: 'returned',               label: 'Returned' },
    { key: '',                       label: 'All' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Issue & Return</h1>
          <p className="page-subtitle">Manage book lending for students and staff</p>
        </div>
        <button onClick={() => setIssueOpen(true)} className="btn btn-primary btn-md">
          <BookOpen size={15}/> Issue Book
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setStatusFilter(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-14 rounded-lg"/>)}</div>
          : issues.length === 0
            ? (
              <div className="card-body text-center py-14 text-slate-400">
                <BookOpen size={32} className="mx-auto mb-3 text-slate-300"/>
                <p>No records found.</p>
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Book</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Member</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Issue Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Due Date</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                      <th className="px-4 py-3"/>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(issue => {
                      const isOverdue = ['issued','renewed'].includes(issue.status) && dayjs(issue.dueDate).isBefore(dayjs());
                      const name = issue.userId ? `${issue.userId.profile?.firstName ?? ''} ${issue.userId.profile?.lastName ?? ''}`.trim() : '—';
                      return (
                        <tr key={issue._id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${isOverdue ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-700 line-clamp-1">{issue.bookId?.title}</p>
                            <p className="text-xs text-slate-400">{issue.bookId?.author}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-700">{name}</p>
                            <p className="text-xs text-slate-400 capitalize">{issue.memberModel}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{dayjs(issue.issueDate).format('DD MMM YYYY')}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                              {dayjs(issue.dueDate).format('DD MMM YYYY')}
                              {isOverdue && <span className="block text-red-400">{dayjs().diff(dayjs(issue.dueDate),'day')}d overdue</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`badge text-xs ${STATUS_COLOR[issue.status] ?? 'badge-slate'}`}>
                              {isOverdue ? 'overdue' : issue.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {issue.status !== 'returned' && (
                              <div className="flex items-center gap-1">
                                <button onClick={() => setReturnIssue(issue)} className="btn btn-ghost btn-xs text-emerald-600 hover:bg-emerald-50">
                                  <RotateCcw size={11}/> Return
                                </button>
                                {issue.renewCount < 2 && (
                                  <button onClick={() => renewMut.mutate(issue._id)} className="btn btn-ghost btn-xs text-primary-600 hover:bg-primary-50">
                                    <RefreshCw size={11}/> Renew
                                  </button>
                                )}
                              </div>
                            )}
                            {issue.fineAmount > 0 && (
                              <p className="text-xs text-red-500 mt-0.5">Fine: {fmt(issue.fineAmount)}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>

      <IssueModal open={issueOpen} onClose={() => setIssueOpen(false)}/>
      <ReturnModal open={!!returnIssue} onClose={() => setReturnIssue(null)} issue={returnIssue}/>
    </div>
  );
}
