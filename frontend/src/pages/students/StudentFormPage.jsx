import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Search } from 'lucide-react';
import api from '../../lib/axios';

export default function StudentFormPage() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const qc      = useQueryClient();
  const isEdit  = !!id;

  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: existing } = useQuery({
    queryKey: ['student', id],
    queryFn:  () => api.get(`/students/${id}`).then(r => r.data.data),
    enabled:  isEdit,
  });

  const { data: userResults = [] } = useQuery({
    queryKey: ['users-search', userSearch],
    queryFn:  () => userSearch.length > 1
      ? api.get('/users', { params: { search: userSearch, role: 'student', limit: 10 } }).then(r => r.data.data)
      : [],
    enabled: !isEdit,
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      section: 'A', feeCategory: 'general', employmentType: 'permanent',
      transportEnrolled: false, hostelEnrolled: false,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        class: existing.class, section: existing.section, academicYear: existing.academicYear,
        house: existing.house ?? '', feeCategory: existing.feeCategory,
        transportEnrolled: existing.transport?.enrolled ?? false,
        routeNo: existing.transport?.routeNo ?? '', vehicleNo: existing.transport?.vehicleNo ?? '',
        pickupPoint: existing.transport?.pickupPoint ?? '', busPassNo: existing.transport?.busPassNo ?? '',
        pickupTime: existing.transport?.pickupTime ?? '', dropTime: existing.transport?.dropTime ?? '',
        hostelEnrolled: existing.hostel?.enrolled ?? false,
        hostelName: existing.hostel?.hostelName ?? '', roomNo: existing.hostel?.roomNo ?? '',
        bedNo: existing.hostel?.bedNo ?? '',
        doctorName: existing.medical?.doctorName ?? '', doctorPhone: existing.medical?.doctorPhone ?? '',
        height: existing.medical?.height ?? '', weight: existing.medical?.weight ?? '',
      });
    }
  }, [existing, reset]);

  const mut = useMutation({
    mutationFn: data => {
      const payload = {
        ...(isEdit ? {} : { userId: selectedUser?._id }),
        class: data.class, section: data.section, academicYear: data.academicYear,
        house: data.house, feeCategory: data.feeCategory,
        transport: { enrolled: data.transportEnrolled, routeNo: data.routeNo, vehicleNo: data.vehicleNo,
          pickupPoint: data.pickupPoint, busPassNo: data.busPassNo, pickupTime: data.pickupTime, dropTime: data.dropTime },
        hostel: { enrolled: data.hostelEnrolled, hostelName: data.hostelName, roomNo: data.roomNo, bedNo: data.bedNo },
        medical: { doctorName: data.doctorName, doctorPhone: data.doctorPhone, height: data.height || undefined, weight: data.weight || undefined },
      };
      return isEdit ? api.put(`/students/${id}`, payload) : api.post('/students', payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Profile updated' : 'Student profile created');
      qc.invalidateQueries(['students']); qc.invalidateQueries(['student-stats']);
      nav('/students');
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  const F = ({ name, label, opts = {} }) => (
    <div>
      <label className="label">{label}</label>
      <input className={`input w-full ${errors[name] ? 'input-error' : ''}`} {...register(name)} {...opts} />
      {errors[name] && <p className="field-error">{errors[name].message}</p>}
    </div>
  );

  const transportEnrolled = watch('transportEnrolled');
  const hostelEnrolled    = watch('hostelEnrolled');

  const currentYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-1">
            <ArrowLeft size={14}/> Back
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Student Profile' : 'Add Student Profile'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">

        {/* User selector (create only) */}
        {!isEdit && (
          <div className="card card-body space-y-3">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Select User Account</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input className="input pl-9 w-full" placeholder="Search by name or email…"
                value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            {userResults.length > 0 && !selectedUser && (
              <ul className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                {userResults.map(u => (
                  <li key={u._id}>
                    <button type="button" onClick={() => { setSelectedUser(u); setUserSearch(''); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.profile?.firstName?.[0]}{u.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{u.profile?.firstName} {u.profile?.lastName}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedUser && (
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                <div className="w-8 h-8 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-xs font-bold">
                  {selectedUser.profile?.firstName?.[0]}{selectedUser.profile?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedUser.profile?.firstName} {selectedUser.profile?.lastName}</p>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
                <button type="button" onClick={() => setSelectedUser(null)} className="text-xs text-red-500 hover:underline">Change</button>
              </div>
            )}
            {!selectedUser && <p className="field-hint">Search and select a user with the Student role to create their profile.</p>}
          </div>
        )}

        {/* Academic */}
        <div className="card card-body space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Academic Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <F name="class"        label="Class *"         opts={{ placeholder: 'Grade 5' }} />
            <F name="section"      label="Section"         opts={{ placeholder: 'A' }} />
            <F name="academicYear" label="Academic Year *" opts={{ placeholder: currentYear }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F name="house" label="House" opts={{ placeholder: 'Red / Blue…' }} />
            <div>
              <label className="label">Fee Category</label>
              <select className="input w-full" {...register('feeCategory')}>
                {['general','scholarship','staff_ward','ews','other'].map(c =>
                  <option key={c} value={c} className="capitalize">{c.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Medical */}
        <div className="card card-body space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Medical Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F name="doctorName"  label="Doctor Name" />
            <F name="doctorPhone" label="Doctor Phone" opts={{ type: 'tel' }} />
            <F name="height"      label="Height (cm)" opts={{ type: 'number' }} />
            <F name="weight"      label="Weight (kg)" opts={{ type: 'number' }} />
          </div>
        </div>

        {/* Transport */}
        <div className="card card-body space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Transport</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('transportEnrolled')} className="w-4 h-4 rounded text-primary-600"/>
              <span className="text-sm text-slate-600">Enrolled in school bus</span>
            </label>
          </div>
          {transportEnrolled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F name="routeNo"     label="Route No" />
              <F name="vehicleNo"   label="Vehicle No" />
              <F name="pickupPoint" label="Pickup Point" />
              <F name="busPassNo"   label="Bus Pass No" />
              <F name="pickupTime"  label="Pickup Time" opts={{ type: 'time' }} />
              <F name="dropTime"    label="Drop Time"   opts={{ type: 'time' }} />
            </div>
          )}
        </div>

        {/* Hostel */}
        <div className="card card-body space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Hostel</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('hostelEnrolled')} className="w-4 h-4 rounded text-primary-600"/>
              <span className="text-sm text-slate-600">Residing in hostel</span>
            </label>
          </div>
          {hostelEnrolled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F name="hostelName" label="Hostel Name" />
              <F name="roomNo"     label="Room No" />
              <F name="bedNo"      label="Bed No" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => nav(-1)} className="btn btn-outline btn-md">Cancel</button>
          <button type="submit" disabled={mut.isPending || (!isEdit && !selectedUser)} className="btn btn-primary btn-md">
            {mut.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={15}/>}
            {isEdit ? 'Save Changes' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
