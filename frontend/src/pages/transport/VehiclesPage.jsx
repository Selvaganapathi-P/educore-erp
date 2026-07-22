import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Bus, Pencil, Trash2, X, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const TYPE_ICON  = { bus: '🚌', van: '🚐', auto: '🛺', tempo: '🚛' };
const STATUS_CFG = {
  active:      { label: 'Active',      color: 'badge-success', icon: CheckCircle2 },
  maintenance: { label: 'Maintenance', color: 'badge-warning', icon: Wrench       },
  inactive:    { label: 'Inactive',    color: 'badge-slate',   icon: Bus          },
};

function VehicleModal({ open, onClose, existing }) {
  const qc     = useQueryClient();
  const isEdit = !!existing;

  const { data: staff = [] } = useQuery({
    queryKey: ['staff-list'],
    queryFn:  () => api.get('/staff', { params: { limit: 100 } }).then(r => r.data.data),
    staleTime: 300_000,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes-list'],
    queryFn:  () => api.get('/transport/routes').then(r => r.data.data),
    staleTime: 60_000,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: existing ?? {
      registrationNo: '', vehicleType: 'bus', model: '', capacity: '',
      color: '', driverId: '', conductorId: '', routeId: '',
      insuranceExpiry: '', pucExpiry: '', fitnessExpiry: '', notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/transport/vehicles/${existing._id}`, body).then(r => r.data)
      : api.post('/transport/vehicles', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transport-vehicles'] });
      qc.invalidateQueries({ queryKey: ['transport-dashboard'] });
      toast.success(isEdit ? 'Updated' : 'Vehicle added');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const staffName = (s) => {
    const p = s.userId?.profile;
    return p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : s.employeeId;
  };

  const onSubmit = (data) => mutation.mutate({ ...data, capacity: Number(data.capacity) });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-2xl">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Registration No *</label>
                <input {...register('registrationNo',{required:true})} className="form-input" placeholder="KA-01-AB-1234"/>
                {errors.registrationNo && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select {...register('vehicleType')} className="form-select">
                  {['bus','van','auto','tempo'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Make / Model</label>
                <input {...register('model')} className="form-input" placeholder="e.g. Tata Starbus"/>
              </div>
              <div className="form-group">
                <label className="form-label">Seating Capacity *</label>
                <input type="number" min="1" {...register('capacity',{required:true,min:1})} className="form-input"/>
                {errors.capacity && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input {...register('color')} className="form-input" placeholder="Yellow"/>
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Route</label>
                <select {...register('routeId')} className="form-select">
                  <option value="">No route</option>
                  {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Driver</label>
                <select {...register('driverId')} className="form-select">
                  <option value="">Select driver</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{staffName(s)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Conductor</label>
                <select {...register('conductorId')} className="form-select">
                  <option value="">No conductor</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{staffName(s)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Insurance Expiry</label>
                <input type="date" {...register('insuranceExpiry')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">PUC Expiry</label>
                <input type="date" {...register('pucExpiry')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Fitness Expiry</label>
                <input type="date" {...register('fitnessExpiry')} className="form-input"/>
              </div>
              {isEdit && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select {...register('status')} className="form-select">
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="form-group sm:col-span-2">
                <label className="form-label">Notes</label>
                <textarea {...register('notes')} className="form-textarea" rows={2}/>
              </div>
            </div>
            <div className="dialog-footer mt-4">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function VehiclesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['transport-vehicles', statusFilter],
    queryFn:  () => api.get('/transport/vehicles', { params: statusFilter ? { status: statusFilter } : {} }).then(r => r.data.data),
    staleTime: 30_000,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/transport/vehicles/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transport-vehicles'] }); toast.success('Deleted'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const docAlert = (date) => {
    if (!date) return null;
    const d = dayjs(date);
    if (d.isBefore(dayjs())) return 'expired';
    if (d.isBefore(dayjs().add(30,'day'))) return 'expiring';
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Fleet</h1>
          <p className="page-subtitle">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={() => setModal('new')} className="btn btn-primary btn-md">
          <Plus size={15}/> Add Vehicle
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {[['','All'],['active','Active'],['maintenance','Maintenance'],['inactive','Inactive']].map(([v,l]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${statusFilter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
            {l}
          </button>
        ))}
      </div>

      {isLoading
        ? <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-28 rounded-xl"/>)}</div>
        : vehicles.length === 0
          ? (
            <div className="card card-body text-center py-16 text-slate-400">
              <Bus size={36} className="mx-auto mb-3 text-slate-300"/>
              <p className="font-medium">No vehicles registered</p>
            </div>
          )
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(v => {
                const cfg  = STATUS_CFG[v.status] ?? STATUS_CFG.active;
                const Icon = cfg.icon;
                const insAlert  = docAlert(v.insuranceExpiry);
                const pucAlert  = docAlert(v.pucExpiry);
                const fitAlert  = docAlert(v.fitnessExpiry);
                const hasAlert  = insAlert || pucAlert || fitAlert;

                const driverName = (() => {
                  const u = v.driverId?.userId;
                  return u ? `${u.profile?.firstName ?? ''} ${u.profile?.lastName ?? ''}`.trim() : null;
                })();

                return (
                  <div key={v._id} className={`card card-body space-y-3 ${hasAlert ? 'border border-amber-200' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{TYPE_ICON[v.vehicleType] ?? '🚌'}</span>
                        <div>
                          <p className="font-semibold text-slate-800">{v.registrationNo}</p>
                          <p className="text-xs text-slate-500">{v.model || v.vehicleType} · {v.capacity} seats</p>
                        </div>
                      </div>
                      <span className={`badge text-xs inline-flex items-center gap-1 ${cfg.color}`}>
                        <Icon size={9}/> {cfg.label}
                      </span>
                    </div>

                    {v.routeId && (
                      <p className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
                        Route: <span className="font-medium text-slate-700">{v.routeId.name}</span>
                      </p>
                    )}

                    {driverName && (
                      <p className="text-xs text-slate-500">Driver: <span className="font-medium">{driverName}</span></p>
                    )}

                    {hasAlert && (
                      <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg px-2 py-1.5">
                        <AlertTriangle size={11} className="text-amber-500 shrink-0"/>
                        <p className="text-xs text-amber-700">
                          {[insAlert && 'Insurance', pucAlert && 'PUC', fitAlert && 'Fitness'].filter(Boolean).join(', ')} {insAlert === 'expired' ? 'expired' : 'expiring soon'}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                      <button onClick={() => setModal(v)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={13}/></button>
                      <button onClick={() => deleteMut.mutate(v._id)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
      }

      <VehicleModal
        open={!!modal}
        onClose={() => setModal(null)}
        existing={modal && modal !== 'new' ? modal : null}
      />
    </div>
  );
}
