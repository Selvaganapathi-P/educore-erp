import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, BedDouble, Pencil, Trash2, X, Wrench } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const ROOM_TYPE_LABEL = { single:'Single', double:'Double', triple:'Triple', dormitory:'Dormitory' };
const STATUS_CFG = {
  available:   { color: 'badge-success', label: 'Available'   },
  full:        { color: 'badge-error',   label: 'Full'        },
  maintenance: { color: 'badge-warning', label: 'Maintenance' },
};
const AMENITY_LIST = ['AC','Attached Bath','Hot Water','TV','Wardrobe','Study Table','Balcony'];

function RoomModal({ open, onClose, existing, hostelId }) {
  const qc     = useQueryClient();
  const isEdit = !!existing;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: existing ? {
      hostelId:   existing.hostelId?._id || existing.hostelId || hostelId || '',
      roomNumber: existing.roomNumber,
      floor:      existing.floor || 'G',
      roomType:   existing.roomType,
      capacity:   existing.capacity,
      monthlyFee: existing.monthlyFee || '',
      amenities:  existing.amenities || [],
      notes:      existing.notes || '',
    } : { hostelId: hostelId || '', roomNumber:'', floor:'G', roomType:'double', capacity:2, monthlyFee:'', amenities:[], notes:'' },
  });

  const selAmenities = watch('amenities') ?? [];
  const toggleA = (a) => setValue('amenities', selAmenities.includes(a) ? selAmenities.filter(x=>x!==a) : [...selAmenities,a]);

  const { data: hostels = [] } = useQuery({
    queryKey: ['hostels'],
    queryFn:  () => api.get('/hostel/hostels').then(r => r.data.data),
    staleTime: 120_000,
  });

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/hostel/rooms/${existing._id}`, body).then(r => r.data)
      : api.post('/hostel/rooms', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostel-rooms'] });
      toast.success(isEdit ? 'Room updated' : 'Room added');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => mutation.mutate({ ...data, capacity: Number(data.capacity), monthlyFee: Number(data.monthlyFee) || 0 });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit Room' : 'Add Room'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group col-span-2">
                <label className="form-label">Hostel *</label>
                <select {...register('hostelId',{required:true})} className="form-select">
                  <option value="">Select hostel</option>
                  {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                </select>
                {errors.hostelId && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Room Number *</label>
                <input {...register('roomNumber',{required:true})} className="form-input" placeholder="101"/>
                {errors.roomNumber && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input {...register('floor')} className="form-input" placeholder="G / 1 / 2"/>
              </div>
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select {...register('roomType')} className="form-select">
                  {Object.entries(ROOM_TYPE_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (beds) *</label>
                <input type="number" min="1" {...register('capacity',{required:true,min:1})} className="form-input"/>
                {errors.capacity && <p className="form-error">Min 1</p>}
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Monthly Fee (₹)</label>
                <input type="number" min="0" {...register('monthlyFee')} className="form-input" placeholder="0"/>
              </div>
              {isEdit && (
                <div className="form-group col-span-2">
                  <label className="form-label">Status</label>
                  <select {...register('status')} className="form-select">
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Amenities</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {AMENITY_LIST.map(a => (
                  <button key={a} type="button" onClick={() => toggleA(a)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${selAmenities.includes(a) ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-primary-300'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input {...register('notes')} className="form-input"/>
            </div>
            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Add Room'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function RoomsPage() {
  const qc = useQueryClient();
  const [modal,        setModal]        = useState(null);
  const [hostelFilter, setHostelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: hostels = [] } = useQuery({
    queryKey: ['hostels'],
    queryFn:  () => api.get('/hostel/hostels').then(r => r.data.data),
    staleTime: 60_000,
  });

  const params = {};
  if (hostelFilter) params.hostelId = hostelFilter;
  if (statusFilter) params.status   = statusFilter;

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['hostel-rooms', hostelFilter, statusFilter],
    queryFn:  () => api.get('/hostel/rooms', { params }).then(r => r.data.data),
    staleTime: 30_000,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/hostel/rooms/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hostel-rooms'] }); toast.success('Deleted'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rooms</h1>
          <p className="page-subtitle">{rooms.length} room{rooms.length !== 1 ? 's' : ''} listed</p>
        </div>
        <button onClick={() => setModal({ hostelId: hostelFilter })} className="btn btn-primary btn-md">
          <Plus size={15}/> Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={hostelFilter} onChange={e => setHostelFilter(e.target.value)} className="form-select w-52">
          <option value="">All Hostels</option>
          {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
        </select>
        <div className="flex gap-2">
          {[['','All'],['available','Available'],['full','Full'],['maintenance','Maintenance']].map(([v,l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${statusFilter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {isLoading
        ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-28 rounded-xl"/>)}</div>
        : rooms.length === 0
          ? (
            <div className="card card-body text-center py-14 text-slate-400">
              <BedDouble size={36} className="mx-auto mb-3 text-slate-300"/>
              <p className="font-medium">No rooms found</p>
            </div>
          )
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rooms.map(room => {
                const cfg     = STATUS_CFG[room.status] ?? STATUS_CFG.available;
                const occPct  = room.capacity ? Math.round((room.occupiedBeds / room.capacity) * 100) : 0;
                const barClr  = occPct >= 100 ? 'bg-red-500' : occPct > 50 ? 'bg-amber-400' : 'bg-emerald-500';

                return (
                  <div key={room._id} className="card card-body space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-base">Room {room.roomNumber}</p>
                          <span className="text-xs text-slate-400">Floor {room.floor}</span>
                        </div>
                        <p className="text-xs text-slate-500">{ROOM_TYPE_LABEL[room.roomType]} · {room.capacity} beds</p>
                      </div>
                      <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barClr}`} style={{ width: `${Math.min(occPct,100)}%` }}/>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{room.occupiedBeds}/{room.capacity} occupied</span>
                        {room.monthlyFee > 0 && <span>₹{room.monthlyFee}/mo</span>}
                      </div>
                    </div>

                    {room.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0,3).map(a => <span key={a} className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{a}</span>)}
                        {room.amenities.length > 3 && <span className="text-xs text-slate-400">+{room.amenities.length-3}</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                      <button onClick={() => setModal(room)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={13}/></button>
                      <button onClick={() => deleteMut.mutate(room._id)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
      }

      <RoomModal
        open={!!modal}
        onClose={() => setModal(null)}
        existing={modal && !modal.hostelId ? modal : null}
        hostelId={modal?.hostelId || hostelFilter}
      />
    </div>
  );
}
