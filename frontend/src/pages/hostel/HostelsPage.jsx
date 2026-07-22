import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Home, Pencil, Trash2, X, BedDouble, Users, Phone } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const TYPE_CFG = {
  boys:   { label: 'Boys',   color: 'badge-primary', bg: 'bg-blue-50'  },
  girls:  { label: 'Girls',  color: 'badge-info',    bg: 'bg-pink-50'  },
  co_ed:  { label: 'Co-Ed',  color: 'badge-warning', bg: 'bg-purple-50'},
};

const AMENITY_LIST = ['WiFi','Mess','Laundry','CCTV','Hot Water','AC','Generator','Gym','Study Room','TV Room'];

function HostelModal({ open, onClose, existing }) {
  const qc     = useQueryClient();
  const isEdit = !!existing;

  const { data: staff = [] } = useQuery({
    queryKey: ['staff-list'],
    queryFn:  () => api.get('/staff', { params: { limit: 100 } }).then(r => r.data.data),
    staleTime: 300_000,
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: existing ? {
      name:         existing.name,
      type:         existing.type,
      wardenId:     existing.wardenId?._id || existing.wardenId || '',
      address:      existing.address || '',
      contactPhone: existing.contactPhone || '',
      amenities:    existing.amenities || [],
    } : { name:'', type:'boys', wardenId:'', address:'', contactPhone:'', amenities:[] },
  });

  const selectedAmenities = watch('amenities') ?? [];
  const toggleAmenity = (a) => setValue('amenities', selectedAmenities.includes(a) ? selectedAmenities.filter(x => x !== a) : [...selectedAmenities, a]);

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/hostel/hostels/${existing._id}`, body).then(r => r.data)
      : api.post('/hostel/hostels', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hostels'] });
      qc.invalidateQueries({ queryKey: ['hostel-dashboard'] });
      toast.success(isEdit ? 'Updated' : 'Hostel created');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const staffName = (s) => {
    const p = s.userId?.profile;
    return p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : s.employeeId;
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit Hostel' : 'New Hostel'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="dialog-body space-y-4">
            <div className="form-group">
              <label className="form-label">Hostel Name *</label>
              <input {...register('name',{required:true})} className="form-input" placeholder="e.g. Boys Hostel Block A"/>
              {errors.name && <p className="form-error">Required</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select {...register('type')} className="form-select">
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="co_ed">Co-Ed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Warden</label>
              <select {...register('wardenId')} className="form-select">
                <option value="">No warden assigned</option>
                {staff.map(s => <option key={s._id} value={s._id}>{staffName(s)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea {...register('address')} className="form-textarea" rows={2}/>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input {...register('contactPhone')} className="form-input" placeholder="+91 …"/>
            </div>
            <div className="form-group">
              <label className="form-label">Amenities</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {AMENITY_LIST.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${selectedAmenities.includes(a) ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500 hover:border-primary-300'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Create Hostel'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function HostelsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data: hostels = [], isLoading } = useQuery({
    queryKey: ['hostels'],
    queryFn:  () => api.get('/hostel/hostels').then(r => r.data.data),
    staleTime: 30_000,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/hostel/hostels/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hostels'] }); toast.success('Deleted'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const wardenName = (h) => {
    const u = h.wardenId?.userId;
    return u ? `${u.profile?.firstName ?? ''} ${u.profile?.lastName ?? ''}`.trim() : null;
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hostels</h1>
          <p className="page-subtitle">{hostels.length} hostel building{hostels.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('new')} className="btn btn-primary btn-md">
          <Plus size={15}/> New Hostel
        </button>
      </div>

      {isLoading
        ? <div className="grid sm:grid-cols-2 gap-4">{Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-44 rounded-xl"/>)}</div>
        : hostels.length === 0
          ? (
            <div className="card card-body text-center py-16 text-slate-400">
              <Home size={36} className="mx-auto mb-3 text-slate-300"/>
              <p className="font-medium">No hostels added yet</p>
            </div>
          )
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hostels.map(h => {
                const cfg    = TYPE_CFG[h.type] ?? TYPE_CFG.boys;
                const stats  = h._stats ?? {};
                const occPct = stats.totalBeds ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;
                const barClr = occPct >= 90 ? 'bg-red-500' : occPct >= 70 ? 'bg-amber-400' : 'bg-emerald-500';

                return (
                  <div key={h._id} className="card card-body space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-slate-800">{h.name}</p>
                          <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        {wardenName(h) && <p className="text-xs text-slate-500">Warden: {wardenName(h)}</p>}
                        {h.contactPhone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={10}/>{h.contactPhone}</p>
                        )}
                      </div>
                    </div>

                    {/* Occupancy */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><BedDouble size={11}/>{stats.totalBeds ?? 0} beds · {stats.totalRooms ?? 0} rooms</span>
                        <span className="font-medium">{occPct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barClr}`} style={{ width: `${occPct}%` }}/>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{stats.occupiedBeds ?? 0} occupied</span>
                        <span>{(stats.totalBeds ?? 0) - (stats.occupiedBeds ?? 0)} free</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {h.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {h.amenities.slice(0,4).map(a => <span key={a} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{a}</span>)}
                        {h.amenities.length > 4 && <span className="text-xs text-slate-400">+{h.amenities.length - 4}</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                      <button onClick={() => setModal(h)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={13}/></button>
                      <button onClick={() => deleteMut.mutate(h._id)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
      }

      <HostelModal open={!!modal} onClose={() => setModal(null)} existing={modal && modal !== 'new' ? modal : null}/>
    </div>
  );
}
