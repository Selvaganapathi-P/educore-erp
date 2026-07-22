import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Pencil, Trash2, X, MapPin, ChevronDown, ChevronUp, GripVertical, Users } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

function RouteModal({ open, onClose, existing }) {
  const qc     = useQueryClient();
  const isEdit = !!existing;

  const { data: vehicles = [] } = useQuery({
    queryKey: ['transport-vehicles'],
    queryFn:  () => api.get('/transport/vehicles', { params: { status: 'active' } }).then(r => r.data.data),
    staleTime: 60_000,
  });

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: existing ? {
      name:      existing.name,
      vehicleId: existing.vehicleId?._id || '',
      notes:     existing.notes || '',
      stops:     existing.stops?.length
        ? existing.stops.map(s => ({ name: s.name, order: s.order, pickupTime: s.pickupTime || '', dropTime: s.dropTime || '', distanceKm: s.distanceKm || '', fare: s.fare || '' }))
        : [{ name: '', order: 1, pickupTime: '', dropTime: '', distanceKm: '', fare: '' }],
    } : {
      name: '', vehicleId: '', notes: '',
      stops: [{ name: '', order: 1, pickupTime: '', dropTime: '', distanceKm: '', fare: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'stops' });

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/transport/routes/${existing._id}`, body).then(r => r.data)
      : api.post('/transport/routes', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transport-routes'] });
      toast.success(isEdit ? 'Route updated' : 'Route created');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      stops: data.stops.map((s, i) => ({
        ...s,
        order:       i + 1,
        distanceKm:  Number(s.distanceKm) || 0,
        fare:        Number(s.fare)        || 0,
      })),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-2xl">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit Route' : 'New Route'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="form-label">Route Name *</label>
                <input {...register('name',{required:true})} className="form-input" placeholder="e.g. Route A — North Campus"/>
                {errors.name && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Vehicle</label>
                <select {...register('vehicleId')} className="form-select">
                  <option value="">No vehicle</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNo} ({v.capacity} seats)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input {...register('notes')} className="form-input" placeholder="Optional remarks"/>
              </div>
            </div>

            {/* Stops builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700">Stops <span className="text-xs text-slate-400 font-normal">(in order)</span></p>
                <button type="button" onClick={() => append({ name:'', order: fields.length+1, pickupTime:'', dropTime:'', distanceKm:'', fare:'' })}
                  className="btn btn-ghost btn-xs"><Plus size={12}/> Add Stop</button>
              </div>
              <div className="space-y-2">
                {fields.map((f, idx) => (
                  <div key={f.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="col-span-1 flex items-center justify-center text-slate-300"><GripVertical size={13}/></div>
                    <div className="col-span-1 text-center text-xs font-bold text-slate-400">{idx + 1}</div>
                    <input {...register(`stops.${idx}.name`,{required:true})} className="form-input col-span-4 text-sm py-1.5" placeholder="Stop name"/>
                    <input type="time" {...register(`stops.${idx}.pickupTime`)} className="form-input col-span-2 text-xs py-1.5" title="Pickup"/>
                    <input type="time" {...register(`stops.${idx}.dropTime`)}   className="form-input col-span-2 text-xs py-1.5" title="Drop"/>
                    <input type="number" {...register(`stops.${idx}.fare`)} min="0" className="form-input col-span-1 text-xs py-1.5" placeholder="₹" title="Fare"/>
                    <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1}
                      className="col-span-1 btn-icon text-red-400 hover:text-red-600 disabled:opacity-30"><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Pickup / Drop times are for student reference. Fare per stop is optional.</p>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update Route' : 'Create Route'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function RoutesPage() {
  const qc = useQueryClient();
  const [modal,    setModal]    = useState(null);
  const [expanded, setExpanded] = useState({});

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['transport-routes'],
    queryFn:  () => api.get('/transport/routes').then(r => r.data.data),
    staleTime: 30_000,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/transport/routes/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transport-routes'] }); toast.success('Deleted'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Routes</h1>
          <p className="page-subtitle">{routes.length} route{routes.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button onClick={() => setModal('new')} className="btn btn-primary btn-md">
          <Plus size={15}/> New Route
        </button>
      </div>

      {isLoading
        ? <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-24 rounded-xl"/>)}</div>
        : routes.length === 0
          ? (
            <div className="card card-body text-center py-16 text-slate-400">
              <MapPin size={36} className="mx-auto mb-3 text-slate-300"/>
              <p className="font-medium">No routes defined yet</p>
              <p className="text-sm mt-1">Create a route to start assigning students.</p>
            </div>
          )
          : (
            <div className="space-y-3">
              {routes.map(route => (
                <div key={route._id} className="card overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800">{route.name}</p>
                        {!route.isActive && <span className="badge badge-slate text-xs">Inactive</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={10}/> {route.stops?.length ?? 0} stops</span>
                        {route.vehicleId && <span>· {route.vehicleId.registrationNo}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setModal(route)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={14}/></button>
                      <button onClick={() => deleteMut.mutate(route._id)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                      <button onClick={() => toggle(route._id)} className="btn-icon text-slate-400">
                        {expanded[route._id] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </button>
                    </div>
                  </div>

                  {expanded[route._id] && route.stops?.length > 0 && (
                    <div className="border-t border-slate-100">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 w-8">#</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Stop</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 hidden sm:table-cell">Pickup</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 hidden sm:table-cell">Drop</th>
                            <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 hidden md:table-cell">Fare</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...route.stops].sort((a,b) => a.order - b.order).map(stop => (
                            <tr key={stop.name} className="border-t border-slate-100">
                              <td className="px-4 py-2 text-xs text-slate-400">{stop.order}</td>
                              <td className="px-4 py-2 text-sm text-slate-700 flex items-center gap-1.5">
                                <MapPin size={11} className="text-primary-400 shrink-0"/>{stop.name}
                              </td>
                              <td className="px-4 py-2 text-xs text-slate-500 hidden sm:table-cell">{stop.pickupTime || '—'}</td>
                              <td className="px-4 py-2 text-xs text-slate-500 hidden sm:table-cell">{stop.dropTime || '—'}</td>
                              <td className="px-4 py-2 text-xs text-slate-500 text-right hidden md:table-cell">{stop.fare > 0 ? `₹${stop.fare}` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
      }

      <RouteModal
        open={!!modal}
        onClose={() => setModal(null)}
        existing={modal && modal !== 'new' ? modal : null}
      />
    </div>
  );
}
