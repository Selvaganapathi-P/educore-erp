import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, UserCheck, X, Users, MapPin, Trash2, Plus } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const TYPE_LABEL = { pickup: 'Pickup', drop: 'Drop', both: 'Both Ways' };
const TYPE_COLOR = { pickup: 'badge-primary', drop: 'badge-info', both: 'badge-success' };

function AssignModal({ open, onClose }) {
  const qc = useQueryClient();
  const [search,    setSearch]    = useState('');
  const [selStudent, setSelStudent] = useState(null);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { studentId:'', routeId:'', stopName:'', academicYearId:'', transportType:'both', feeAmount:'' },
  });

  const { data: students = [] } = useQuery({
    queryKey: ['student-search-transport', search],
    queryFn:  () => search.length >= 2
      ? api.get('/students', { params: { search, limit: 8 } }).then(r => r.data.data)
      : [],
    staleTime: 15_000,
    enabled: search.length >= 2,
  });

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  () => api.get('/academics/years').then(r => r.data.data),
    staleTime: 300_000,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['transport-routes'],
    queryFn:  () => api.get('/transport/routes').then(r => r.data.data),
    staleTime: 60_000,
  });

  const selectedRoute = routes.find(r => r._id === watch('routeId'));
  const stops = selectedRoute?.stops ?? [];

  const mutation = useMutation({
    mutationFn: (body) => api.post('/transport/students', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['route-students'] });
      toast.success('Student assigned to route');
      onClose(); reset(); setSelStudent(null); setSearch('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => mutation.mutate({ ...data, feeAmount: Number(data.feeAmount) || 0 });

  const sName = (s) => {
    const p = s.userId?.profile;
    return p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : s.rollNumber;
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Assign Student to Route</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            {/* Student search */}
            <div className="form-group">
              <label className="form-label">Student *</label>
              {selStudent
                ? (
                  <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                    <UserCheck size={14} className="text-primary-600"/>
                    <span className="text-sm font-medium flex-1">{sName(selStudent)}</span>
                    <span className="text-xs text-slate-400">Roll: {selStudent.rollNumber}</span>
                    <button type="button" onClick={() => { setSelStudent(null); setValue('studentId',''); }} className="btn-icon text-slate-400"><X size={12}/></button>
                  </div>
                )
                : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8" placeholder="Search student by name or roll…"/>
                    {students.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 divide-y divide-slate-100 max-h-44 overflow-y-auto">
                        {students.map(s => (
                          <button key={s._id} type="button"
                            onClick={() => { setSelStudent(s); setValue('studentId', s._id); setSearch(''); }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left">
                            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-bold">{sName(s)[0]?.toUpperCase()}</div>
                            <div>
                              <p className="text-sm font-medium">{sName(s)}</p>
                              <p className="text-xs text-slate-400">Roll: {s.rollNumber} · {s.currentClass?.name}</p>
                            </div>
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
              <label className="form-label">Route *</label>
              <select {...register('routeId',{required:true})} className="form-select" onChange={e => { setValue('routeId', e.target.value); setValue('stopName',''); }}>
                <option value="">Select route</option>
                {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
              {errors.routeId && <p className="form-error">Required</p>}
            </div>

            {stops.length > 0 && (
              <div className="form-group">
                <label className="form-label">Boarding Stop *</label>
                <select {...register('stopName',{required:true})} className="form-select">
                  <option value="">Select stop</option>
                  {[...stops].sort((a,b)=>a.order-b.order).map(s => <option key={s.name} value={s.name}>{s.order}. {s.name}{s.pickupTime ? ` (${s.pickupTime})` : ''}</option>)}
                </select>
                {errors.stopName && <p className="form-error">Required</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Transport Type</label>
                <select {...register('transportType')} className="form-select">
                  <option value="both">Both Ways</option>
                  <option value="pickup">Pickup only</option>
                  <option value="drop">Drop only</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Fee (₹)</label>
                <input type="number" min="0" {...register('feeAmount')} className="form-input" placeholder="0"/>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function StudentTransportPage() {
  const qc = useQueryClient();
  const [assignOpen, setAssignOpen] = useState(false);
  const [selRoute,   setSelRoute]   = useState('');

  const { data: routes = [] } = useQuery({
    queryKey: ['transport-routes'],
    queryFn:  () => api.get('/transport/routes').then(r => r.data.data),
    staleTime: 60_000,
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['route-students', selRoute],
    queryFn:  () => selRoute
      ? api.get(`/transport/routes/${selRoute}/students`).then(r => r.data.data)
      : [],
    enabled: !!selRoute,
    staleTime: 30_000,
  });

  const removeMut = useMutation({
    mutationFn: (id) => api.patch(`/transport/students/${id}/remove`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['route-students'] }); toast.success('Removed'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const sName = (rec) => {
    const p = rec.userId?.profile;
    return p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : '—';
  };

  // Group by stop
  const byStop = students.reduce((acc, s) => {
    const stop = s.stopName || 'Unknown';
    if (!acc[stop]) acc[stop] = [];
    acc[stop].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Transport</h1>
          <p className="page-subtitle">Assign students to routes and stops</p>
        </div>
        <button onClick={() => setAssignOpen(true)} className="btn btn-primary btn-md">
          <Plus size={15}/> Assign Student
        </button>
      </div>

      {/* Route selector */}
      <div className="card card-body">
        <label className="form-label">Select Route to View Students</label>
        <select value={selRoute} onChange={e => setSelRoute(e.target.value)} className="form-select max-w-sm">
          <option value="">Choose a route…</option>
          {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
      </div>

      {selRoute && (
        <>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400"/>
            <p className="text-sm text-slate-600">{students.length} student{students.length !== 1 ? 's' : ''} on this route</p>
          </div>

          {isLoading
            ? <div className="space-y-2">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
            : students.length === 0
              ? (
                <div className="card card-body text-center py-12 text-slate-400">
                  <Users size={32} className="mx-auto mb-2 text-slate-300"/>
                  <p>No students assigned to this route.</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  {Object.entries(byStop).map(([stopName, recs]) => (
                    <div key={stopName} className="card overflow-hidden">
                      <div className="card-header flex items-center gap-2 bg-slate-50">
                        <MapPin size={13} className="text-primary-500"/>
                        <p className="font-semibold text-slate-700 text-sm">{stopName}</p>
                        <span className="badge badge-slate text-xs">{recs.length}</span>
                      </div>
                      <table className="w-full">
                        <tbody>
                          {recs.map(rec => (
                            <tr key={rec._id} className="border-t border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-2.5">
                                <p className="text-sm font-medium text-slate-700">{sName(rec)}</p>
                                <p className="text-xs text-slate-400">Roll: {rec.studentId?.rollNumber} · {rec.studentId?.currentClass?.name}</p>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className={`badge text-xs ${TYPE_COLOR[rec.transportType] ?? 'badge-slate'}`}>
                                  {TYPE_LABEL[rec.transportType]}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-slate-500 hidden sm:table-cell">
                                {rec.feeAmount > 0 ? `₹${rec.feeAmount}/mo` : '—'}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button onClick={() => removeMut.mutate(rec._id)}
                                  className="btn-icon text-slate-400 hover:text-red-500">
                                  <Trash2 size={13}/>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )
          }
        </>
      )}

      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)}/>
    </div>
  );
}
