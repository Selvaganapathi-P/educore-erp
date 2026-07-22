import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import api from '../../lib/axios';

const STAFF_ROLES = ['school_admin','principal','vice_principal','teacher','hr','receptionist',
  'accountant','librarian','transport_manager','hostel_warden','store_manager',
  'nurse','counselor','security_guard','it_administrator'];

export default function StaffFormPage() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const qc      = useQueryClient();
  const isEdit  = !!id;

  const [userSearch, setUserSearch]   = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: existing } = useQuery({
    queryKey: ['staff-member', id],
    queryFn:  () => api.get(`/staff/${id}`).then(r => r.data.data),
    enabled:  isEdit,
  });

  const { data: userResults = [] } = useQuery({
    queryKey: ['staff-user-search', userSearch],
    queryFn:  () => userSearch.length > 1
      ? api.get('/users', { params: { search: userSearch, limit: 10 } }).then(r =>
          r.data.data.filter(u => STAFF_ROLES.includes(u.role)))
      : [],
    enabled: !isEdit,
  });

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      employmentType: 'permanent',
      leaveBalance: { casual: 12, sick: 7, earned: 15 },
      qualifications: [],
      experience: [],
    },
  });

  const quals = useFieldArray({ control, name: 'qualifications' });
  const exps  = useFieldArray({ control, name: 'experience' });

  useEffect(() => {
    if (existing) {
      reset({
        department: existing.department, designation: existing.designation,
        joiningDate: existing.joiningDate?.slice(0,10),
        employmentType: existing.employmentType,
        subjects: existing.subjects?.join(', ') ?? '',
        classes:  existing.classes?.join(', ')  ?? '',
        biometricId: existing.biometricId ?? '',
        emergencyName: existing.emergencyContact?.name ?? '',
        emergencyRelation: existing.emergencyContact?.relationship ?? '',
        emergencyPhone: existing.emergencyContact?.phone ?? '',
        leaveBalance: existing.leaveBalance ?? { casual: 12, sick: 7, earned: 15 },
        salaryGrade: existing.salary?.grade ?? '',
        qualifications: existing.qualifications ?? [],
        experience: (existing.experience ?? []).map(e => ({
          ...e,
          from: e.from?.slice(0,10),
          to:   e.to?.slice(0,10) ?? '',
        })),
      });
    }
  }, [existing, reset]);

  const mut = useMutation({
    mutationFn: data => {
      const payload = {
        ...(isEdit ? {} : { userId: selectedUser?._id }),
        department: data.department, designation: data.designation,
        joiningDate: data.joiningDate, employmentType: data.employmentType,
        biometricId: data.biometricId || undefined,
        subjects: data.subjects ? data.subjects.split(',').map(s=>s.trim()).filter(Boolean) : [],
        classes:  data.classes  ? data.classes.split(',').map(s=>s.trim()).filter(Boolean)  : [],
        emergencyContact: { name: data.emergencyName, relationship: data.emergencyRelation, phone: data.emergencyPhone },
        leaveBalance: data.leaveBalance,
        salary: { grade: data.salaryGrade },
        qualifications: data.qualifications,
        experience: data.experience.map(e => ({ ...e, isCurrent: !!e.isCurrent })),
      };
      return isEdit ? api.put(`/staff/${id}`, payload) : api.post('/staff', payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Staff profile updated' : 'Staff profile created');
      qc.invalidateQueries(['staff']); qc.invalidateQueries(['staff-stats']);
      nav('/staff');
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  const F = ({ name, label, opts = {} }) => (
    <div>
      <label className="label">{label}</label>
      <input className={`input w-full ${errors[name] ? 'input-error' : ''}`} {...register(name)} {...opts}/>
      {errors[name] && <p className="field-error">{errors[name].message}</p>}
    </div>
  );

  const TABS_DEF = ['Basic','Subjects & Classes','Qualifications','Experience','Emergency & Leaves'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-1">
            <ArrowLeft size={14}/> Back
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Staff Profile' : 'Add Staff Profile'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => mut.mutate(d))}>
        <Tabs.Root defaultValue="Basic">
          <Tabs.List className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-wrap mb-4">
            {TABS_DEF.map(t => (
              <Tabs.Trigger key={t} value={t}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-all
                  data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700
                  text-slate-500 hover:text-slate-700">{t}</Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="Basic">
            <div className="space-y-4">
              {/* User picker */}
              {!isEdit && (
                <div className="card card-body space-y-3">
                  <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Select User Account</h2>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input className="input pl-9 w-full" placeholder="Search staff user…"
                      value={userSearch} onChange={e => setUserSearch(e.target.value)}/>
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
                              <p className="font-medium text-sm">{u.profile?.firstName} {u.profile?.lastName}</p>
                              <p className="text-xs text-slate-400">{u.email} · {u.role?.replace(/_/g,' ')}</p>
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
                        <p className="text-xs text-slate-500">{selectedUser.email} · {selectedUser.role?.replace(/_/g,' ')}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedUser(null)} className="text-xs text-red-500 hover:underline">Change</button>
                    </div>
                  )}
                </div>
              )}
              <div className="card card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F name="department"  label="Department *" opts={{ placeholder: 'Science, Admin…' }}/>
                <F name="designation" label="Designation *" opts={{ placeholder: 'Senior Teacher…' }}/>
                <F name="joiningDate" label="Joining Date *" opts={{ type: 'date' }}/>
                <div>
                  <label className="label">Employment Type</label>
                  <select className="input w-full" {...register('employmentType')}>
                    {['permanent','contractual','part_time','visiting','probation'].map(t=>
                      <option key={t} value={t} className="capitalize">{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <F name="salaryGrade" label="Pay Grade" opts={{ placeholder: 'PB-2, Grade A…' }}/>
                <F name="biometricId" label="Biometric ID" opts={{ placeholder: 'BIO-001' }}/>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="Subjects & Classes">
            <div className="card card-body space-y-4">
              <F name="subjects" label="Subjects (comma-separated)" opts={{ placeholder: 'Mathematics, Physics' }}/>
              <F name="classes"  label="Classes Assigned (comma-separated)" opts={{ placeholder: 'Grade 9, Grade 10' }}/>
            </div>
          </Tabs.Content>

          <Tabs.Content value="Qualifications">
            <div className="card card-body space-y-4">
              {quals.fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-slate-100">
                  <input className="input" placeholder="Degree *" {...register(`qualifications.${i}.degree`)}/>
                  <input className="input" placeholder="Subject"  {...register(`qualifications.${i}.subject`)}/>
                  <input className="input" placeholder="Institution" {...register(`qualifications.${i}.institution`)}/>
                  <input className="input" placeholder="Year" type="number" {...register(`qualifications.${i}.year`)}/>
                  <input className="input" placeholder="Percentage" type="number" {...register(`qualifications.${i}.percentage`)}/>
                  <button type="button" onClick={() => quals.remove(i)} className="btn btn-icon btn-ghost text-red-500">
                    <Trash2 size={15}/>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => quals.append({ degree:'', subject:'', institution:'', year:'', percentage:'' })}
                className="btn btn-outline btn-sm">
                <Plus size={14}/> Add Qualification
              </button>
            </div>
          </Tabs.Content>

          <Tabs.Content value="Experience">
            <div className="card card-body space-y-4">
              {exps.fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-100">
                  <input className="input sm:col-span-2" placeholder="Job Title *" {...register(`experience.${i}.title`)}/>
                  <input className="input" placeholder="Organization" {...register(`experience.${i}.organization`)}/>
                  <input className="input" type="date" placeholder="From *" {...register(`experience.${i}.from`)}/>
                  <input className="input" type="date" placeholder="To" {...register(`experience.${i}.to`)}/>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" {...register(`experience.${i}.isCurrent`)} className="w-4 h-4 rounded"/>
                    Currently working here
                  </label>
                  <button type="button" onClick={() => exps.remove(i)} className="btn btn-icon btn-ghost text-red-500 justify-self-end">
                    <Trash2 size={15}/>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => exps.append({ title:'', organization:'', from:'', to:'', isCurrent: false })}
                className="btn btn-outline btn-sm">
                <Plus size={14}/> Add Experience
              </button>
            </div>
          </Tabs.Content>

          <Tabs.Content value="Emergency & Leaves">
            <div className="space-y-4">
              <div className="card card-body space-y-4">
                <h3 className="font-semibold text-slate-700">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <F name="emergencyName"     label="Name"/>
                  <F name="emergencyRelation" label="Relationship"/>
                  <F name="emergencyPhone"    label="Phone" opts={{ type: 'tel' }}/>
                </div>
              </div>
              <div className="card card-body space-y-4">
                <h3 className="font-semibold text-slate-700">Leave Balance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <F name="leaveBalance.casual" label="Casual" opts={{ type: 'number', min: 0 }}/>
                  <F name="leaveBalance.sick"   label="Sick"   opts={{ type: 'number', min: 0 }}/>
                  <F name="leaveBalance.earned" label="Earned" opts={{ type: 'number', min: 0 }}/>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>

        <div className="flex justify-end gap-3 mt-4">
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
