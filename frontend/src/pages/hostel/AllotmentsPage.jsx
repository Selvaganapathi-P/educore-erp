import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Search, X, LogOut, UserCheck, BedDouble } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

function AllotModal({ open, onClose }) {
  const qc = useQueryClient();
  const [search,     setSearch]     = useState('');
  const [selStudent, setSelStudent] = useState(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: { studentId:'', hostelId:'', roomId:'', academicYearId:'', bedNumber:'', feeAmount:'', joinDate: dayjs().format('YYYY-MM-DD') },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['student-search-hostel', search],
    queryFn:  () => search.length >= 2 ? api.get('/students', { params: { search, limit: 8 } }).then(r => r.data.data) : [],
    enabled:  search.length >= 2, staleTime: 15_000,
  });
  const { data: years   = [] } = useQuery({ queryKey: ['academic-years'],  queryFn: () => api.get('/academics/years').then(r => r.data.data), staleTime: 300_000 });
  const { data: hostels = [] } = useQuery({ queryKey: ['hostels'],         queryFn: () => api.get('/hostel/hostels').then(r => r.data.data),  staleTime: 120_000 });

  const selHostelId = watch('hostelId');
  const { data: rooms = [] } = useQuery({
    queryKey: ['hostel-rooms-avail', selHostelId],
    queryFn:  () => selHostelId ? api.get('/hostel/rooms', { params: { hostelId: selHostelId, status: 'available' } }).then(r => r.data.data) : [],
    enabled:  !!selHostelId, staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (body) => api.post('/hostel/allotments', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostel-allotments'] });
      qc.invalidateQueries({ queryKey: ['hostel-rooms'] });
      qc.invalidateQueries({ queryKey: ['hostel-dashboard'] });
      toast.success('Student allotted');
      onClose(); reset(); setSelStudent(null); setSearch('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const sName = (s) => { const p = s.userId?.profile; return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : s.rollNumber; };

  const onSubmit = (data) => mutation.mutate({ ...data, feeAmount: Number(data.feeAmount) || 0 });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Allot Room to Student</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            {/* Student */}
            <div className="form-group">
              <label className="form-label">Student *</label>
              {selStudent
                ? (
                  <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                    <UserCheck size={14} className="text-primary-600"/>
                    <span className="flex-1 text-sm font-medium">{sName(selStudent)}</span>
                    <span className="text-xs text-slate-400">Roll: {selStudent.rollNumber}</span>
                    <button type="button" onClick={() => { setSelStudent(null); setValue('studentId',''); }} className="btn-icon text-slate-400"><X size={12}/></button>
                  </div>
                )
                : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8" placeholder="Search by name or roll…"/>
                    {students.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 divide-y divide-slate-100 max-h-44 overflow-y-auto">
                        {students.map(s => (
                          <button key={s._id} type="button" onClick={() => { setSelStudent(s); setValue('studentId',s._id); setSearch(''); }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left">
                            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">{sName(s)[0]?.toUpperCase()}</div>
                            <div><p className="text-sm font-medium">{sName(s)}</p><p className="text-xs text-slate-400">Roll: {s.rollNumber}</p></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              <input type="hidden" {...register('studentId',{required:true})}/>
              {errors.studentId && <p className="form-error">Select a student</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year *</label>
              <select {...register('academicYearId',{required:true})} className="form-select">
                <option value="">Select year</option>
                {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
              </select>
              {errors.academicYearId && <p className="form-error">Required</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Hostel *</label>
              <select {...register('hostelId',{required:true})} className="form-select" onChange={e => { setValue('hostelId',e.target.value); setValue('roomId',''); }}>
                <option value="">Select hostel</option>
                {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
              {errors.hostelId && <p className="form-error">Required</p>}
            </div>

            {selHostelId && (
              <div className="form-group">
                <label className="form-label">Room * <span className="text-xs text-slate-400">(showing available only)</span></label>
                <select {...register('roomId',{required:true})} className="form-select">
                  <option value="">Select room</option>
                  {rooms.map(r => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} (Floor {r.floor}) — {r.capacity - r.occupiedBeds} beds free{r.monthlyFee ? ` · ₹${r.monthlyFee}/mo` : ''}
                    </option>
                  ))}
                </select>
                {errors.roomId && <p className="form-error">Required</p>}
                {rooms.length === 0 && <p className="text-xs text-amber-600 mt-1">No available rooms in this hostel.</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Bed / Bunk No.</label>
                <input {...register('bedNumber')} className="form-input" placeholder="A1 / 1 / Top"/>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Fee (₹)</label>
                <input type="number" min="0" {...register('feeAmount')} className="form-input"/>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Join Date</label>
                <input type="date" {...register('joinDate')} className="form-input"/>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Allotting…' : 'Allot Room'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function VacateModal({ open, onClose, allotment }) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm({ defaultValues: { leaveDate: dayjs().format('YYYY-MM-DD'), leftReason: '' } });

  const mutation = useMutation({
    mutationFn: (body) => api.patch(`/hostel/allotments/${allotment._id}/vacate`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostel-allotments'] });
      qc.invalidateQueries({ queryKey: ['hostel-rooms'] });
      qc.invalidateQueries({ queryKey: ['hostel-dashboard'] });
      toast.success('Student vacated');
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  if (!allotment) return null;
  const name = allotment.userId ? `${allotment.userId.profile?.firstName??''} ${allotment.userId.profile?.lastName??''}`.trim() : '—';

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-sm">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Vacate Room</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="dialog-body space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
              <p className="font-medium text-slate-700">{name}</p>
              <p className="text-slate-500">Room {allotment.roomId?.roomNumber} · {allotment.hostelId?.name}</p>
              <p className="text-slate-400 text-xs">Joined: {dayjs(allotment.joinDate).format('DD MMM YYYY')}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Leave Date</label>
              <input type="date" {...register('leaveDate')} className="form-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <input {...register('leftReason')} className="form-input" placeholder="Completed year / Transfer / etc."/>
            </div>
            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-error btn-md">
                <LogOut size={14}/> {mutation.isPending ? 'Processing…' : 'Vacate'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function AllotmentsPage() {
  const [allotOpen,  setAllotOpen]  = useState(false);
  const [vacateRec,  setVacateRec]  = useState(null);
  const [hostelFilter, setHostelFilter] = useState('');
  const [yearFilter,   setYearFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  const { data: hostels = [] } = useQuery({ queryKey: ['hostels'],        queryFn: () => api.get('/hostel/hostels').then(r => r.data.data), staleTime: 120_000 });
  const { data: years   = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data), staleTime: 300_000 });

  const params = { status: statusFilter };
  if (hostelFilter) params.hostelId       = hostelFilter;
  if (yearFilter)   params.academicYearId = yearFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['hostel-allotments', params],
    queryFn:  () => api.get('/hostel/allotments', { params }).then(r => r.data),
    staleTime: 30_000,
  });

  const allotments = data?.data ?? [];

  const sName = (a) => {
    const p = a.userId?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : '—';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Allotments</h1>
          <p className="page-subtitle">Room allotments for residential students</p>
        </div>
        <button onClick={() => setAllotOpen(true)} className="btn btn-primary btn-md">
          <Plus size={15}/> Allot Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={hostelFilter} onChange={e => setHostelFilter(e.target.value)} className="form-select w-44">
          <option value="">All Hostels</option>
          {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="form-select w-40">
          <option value="">All Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
        <div className="flex gap-2">
          {[['active','Active'],['left','Left'],['transferred','Transferred']].map(([v,l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${statusFilter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-14 rounded-lg"/>)}</div>
          : allotments.length === 0
            ? (
              <div className="card-body text-center py-14 text-slate-400">
                <BedDouble size={32} className="mx-auto mb-2 text-slate-300"/>
                <p>No allotments found.</p>
              </div>
            )
            : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Hostel</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Room</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Fee/mo</th>
                    <th className="px-4 py-3"/>
                  </tr>
                </thead>
                <tbody>
                  {allotments.map(a => (
                    <tr key={a._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-700">{sName(a)}</p>
                        <p className="text-xs text-slate-400">Roll: {a.studentId?.rollNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{a.hostelId?.name}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-700">Room {a.roomId?.roomNumber}</p>
                        <p className="text-xs text-slate-400">Floor {a.roomId?.floor}{a.bedNumber ? ` · Bed ${a.bedNumber}` : ''}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">{dayjs(a.joinDate).format('DD MMM YYYY')}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-right hidden md:table-cell">
                        {a.feeAmount > 0 ? `₹${a.feeAmount}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {a.status === 'active' && (
                          <button onClick={() => setVacateRec(a)} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50">
                            <LogOut size={11}/> Vacate
                          </button>
                        )}
                        {a.status !== 'active' && (
                          <span className="text-xs text-slate-400 capitalize">{a.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
      </div>

      <AllotModal open={allotOpen} onClose={() => setAllotOpen(false)}/>
      <VacateModal open={!!vacateRec} onClose={() => setVacateRec(null)} allotment={vacateRec}/>
    </div>
  );
}
