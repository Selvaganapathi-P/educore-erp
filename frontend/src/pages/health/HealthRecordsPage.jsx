import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, Heart, UserCheck, Plus, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-','unknown'];
const BG_COLORS = { 'A+':'text-red-700 bg-red-100','A-':'text-red-600 bg-red-50','B+':'text-blue-700 bg-blue-100','B-':'text-blue-600 bg-blue-50','AB+':'text-purple-700 bg-purple-100','AB-':'text-purple-600 bg-purple-50','O+':'text-emerald-700 bg-emerald-100','O-':'text-emerald-600 bg-emerald-50',unknown:'text-slate-500 bg-slate-100' };

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput('');
  };
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className="form-input flex-1 text-sm" placeholder={placeholder}/>
        <button type="button" onClick={add} className="btn btn-ghost btn-sm px-2">Add</button>
      </div>
      <div className="flex flex-wrap gap-1">
        {value.map(t => (
          <span key={t} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 text-xs">
            {t}
            <button type="button" onClick={() => onChange(value.filter(x => x !== t))} className="text-slate-400 hover:text-red-500"><X size={10}/></button>
          </span>
        ))}
      </div>
    </div>
  );
}

function RecordModal({ open, onClose, member, memberModel, existing }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: existing ? {
      bloodGroup:               existing.bloodGroup || 'unknown',
      heightCm:                 existing.heightCm   || '',
      weightKg:                 existing.weightKg   || '',
      allergies:                existing.allergies  || [],
      chronicConditions:        existing.chronicConditions || [],
      disabilities:             existing.disabilities || [],
      emergencyContactName:     existing.emergencyContactName     || '',
      emergencyContactPhone:    existing.emergencyContactPhone    || '',
      emergencyContactRelation: existing.emergencyContactRelation || '',
      insuranceProvider:        existing.insuranceProvider || '',
      insurancePolicyNo:        existing.insurancePolicyNo || '',
      notes:                    existing.notes || '',
    } : { bloodGroup:'unknown', heightCm:'', weightKg:'', allergies:[], chronicConditions:[], disabilities:[], emergencyContactName:'', emergencyContactPhone:'', emergencyContactRelation:'', insuranceProvider:'', insurancePolicyNo:'', notes:'' },
  });

  const allergies         = watch('allergies') ?? [];
  const chronicConditions = watch('chronicConditions') ?? [];
  const disabilities      = watch('disabilities') ?? [];

  const mutation = useMutation({
    mutationFn: (body) => api.post('/health/records', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health-records'] });
      qc.invalidateQueries({ queryKey: ['health-dashboard'] });
      toast.success('Health record saved');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const name = member ? (() => {
    const p = member.userId?.profile || member.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : member.rollNumber || member.employeeId || '';
  })() : '';

  const onSubmit = (d) => mutation.mutate({
    memberId: member._id, memberModel,
    ...d,
    heightCm: d.heightCm ? Number(d.heightCm) : undefined,
    weightKg: d.weightKg ? Number(d.weightKg) : undefined,
  });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-2xl">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Health Record — {name}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-5">
            {/* Vitals */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Vitals & Profile</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select {...register('bloodGroup')} className="form-select">
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input type="number" min="1" max="250" {...register('heightCm')} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input type="number" min="1" max="300" step="0.1" {...register('weightKg')} className="form-input"/>
                </div>
              </div>
            </div>

            {/* Medical info */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Medical Information</p>
              <div className="space-y-3">
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <TagInput value={allergies} onChange={v => setValue('allergies', v)} placeholder="e.g. Penicillin, Dust — press Enter"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Chronic Conditions</label>
                  <TagInput value={chronicConditions} onChange={v => setValue('chronicConditions', v)} placeholder="e.g. Asthma, Diabetes — press Enter"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Disabilities</label>
                  <TagInput value={disabilities} onChange={v => setValue('disabilities', v)} placeholder="e.g. Visual impairment — press Enter"/>
                </div>
              </div>
            </div>

            {/* Emergency contact */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Emergency Contact</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input {...register('emergencyContactName')} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input {...register('emergencyContactPhone')} className="form-input"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Relation</label>
                  <input {...register('emergencyContactRelation')} className="form-input" placeholder="Parent / Guardian"/>
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Insurance Provider</label>
                <input {...register('insuranceProvider')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Policy Number</label>
                <input {...register('insurancePolicyNo')} className="form-input"/>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea {...register('notes')} className="form-textarea" rows={2}/>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : 'Save Record'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function HealthRecordsPage() {
  const [search,      setSearch]      = useState('');
  const [selMember,   setSelMember]   = useState(null);
  const [memberModel, setMemberModel] = useState('Student');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [existingRec, setExistingRec] = useState(null);

  const { data: searchResults = [] } = useQuery({
    queryKey: ['health-member-search', memberModel, search],
    queryFn:  () => {
      if (search.length < 2) return [];
      const url = memberModel === 'Student' ? '/students' : '/staff';
      return api.get(url, { params: { search, limit: 8 } }).then(r => r.data.data);
    },
    enabled:  search.length >= 2,
    staleTime: 15_000,
  });

  const { data: record, isLoading: recLoading } = useQuery({
    queryKey: ['health-record-member', selMember?._id, memberModel],
    queryFn:  () => selMember
      ? api.get('/health/records/member', { params: { memberId: selMember._id, memberModel } }).then(r => r.data.data)
      : null,
    enabled: !!selMember,
    staleTime: 30_000,
  });

  const memberName = (m) => {
    const p = m?.userId?.profile || m?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : m?.rollNumber || m?.employeeId || '—';
  };

  const openEdit = () => { setExistingRec(record); setModalOpen(true); };

  const clearMember = () => { setSelMember(null); setSearch(''); setExistingRec(null); };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Health Records</h1>
          <p className="page-subtitle">View and manage individual health profiles</p>
        </div>
      </div>

      {/* Member type toggle + search */}
      <div className="card card-body space-y-4">
        <div className="flex gap-2">
          {['Student','Staff'].map(m => (
            <button key={m} onClick={() => { setMemberModel(m); clearMember(); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${memberModel === m ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
              {m}
            </button>
          ))}
        </div>

        {selMember
          ? (
            <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
              <UserCheck size={14} className="text-primary-600"/>
              <span className="flex-1 text-sm font-medium">{memberName(selMember)}</span>
              <span className="text-xs text-slate-400">{selMember.rollNumber || selMember.employeeId}</span>
              <button onClick={clearMember} className="btn-icon text-slate-400"><X size={12}/></button>
            </div>
          )
          : (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8"
                placeholder={`Search ${memberModel === 'Student' ? 'student by name or roll' : 'staff by name or ID'}…`}/>
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-52 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map(m => (
                    <button key={m._id} type="button" onClick={() => { setSelMember(m); setSearch(''); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 text-left">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {memberName(m)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{memberName(m)}</p>
                        <p className="text-xs text-slate-400">{m.rollNumber || m.employeeId}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        }
      </div>

      {/* Record view */}
      {selMember && (
        <div className="card card-body space-y-5">
          {recLoading
            ? <div className="skeleton h-40 rounded-lg"/>
            : record
              ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-700">Health Profile</p>
                    <button onClick={openEdit} className="btn btn-ghost btn-sm">Edit Record</button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Blood Group</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${BG_COLORS[record.bloodGroup] ?? BG_COLORS.unknown}`}>{record.bloodGroup}</span>
                    </div>
                    {record.heightCm && (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Height</p>
                        <p className="text-base font-semibold text-slate-700">{record.heightCm} cm</p>
                      </div>
                    )}
                    {record.weightKg && (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Weight</p>
                        <p className="text-base font-semibold text-slate-700">{record.weightKg} kg</p>
                        {record.heightCm && <p className="text-xs text-slate-400">BMI: {(record.weightKg / ((record.heightCm/100)**2)).toFixed(1)}</p>}
                      </div>
                    )}
                  </div>

                  {[['Allergies', record.allergies, 'bg-red-50 text-red-700'], ['Chronic Conditions', record.chronicConditions, 'bg-amber-50 text-amber-700'], ['Disabilities', record.disabilities, 'bg-purple-50 text-purple-700']].map(([label, items, color]) =>
                    items?.length > 0 && (
                      <div key={label} className="space-y-1.5">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map(t => <span key={t} className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{t}</span>)}
                        </div>
                      </div>
                    )
                  )}

                  {record.emergencyContactName && (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-0.5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Emergency Contact</p>
                      <p className="text-sm font-medium text-slate-700">{record.emergencyContactName} · {record.emergencyContactRelation}</p>
                      <p className="text-sm text-slate-500">{record.emergencyContactPhone}</p>
                    </div>
                  )}

                  {record.notes && (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Notes</p>
                      <p className="text-sm text-slate-600">{record.notes}</p>
                    </div>
                  )}
                </>
              )
              : (
                <div className="text-center py-10 space-y-3">
                  <Heart size={32} className="mx-auto text-slate-300"/>
                  <p className="text-slate-400 text-sm">No health record for this {memberModel.toLowerCase()} yet.</p>
                  <button onClick={openEdit} className="btn btn-primary btn-sm"><Plus size={13}/> Create Record</button>
                </div>
              )
          }
        </div>
      )}

      <RecordModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setExistingRec(null); }}
        member={selMember}
        memberModel={memberModel}
        existing={existingRec}
      />
    </div>
  );
}
