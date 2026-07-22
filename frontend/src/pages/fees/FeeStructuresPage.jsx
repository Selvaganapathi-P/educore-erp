import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Pencil, Trash2, X, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const FREQ_LABEL = { monthly:'Monthly', quarterly:'Quarterly', half_yearly:'Half-Yearly', annual:'Annual', one_time:'One-Time' };
const FREQ_COLOR = { monthly:'badge-primary', quarterly:'badge-info', half_yearly:'badge-warning', annual:'badge-success', one_time:'badge-slate' };

function fmt(n) { return '₹' + Number(n ?? 0).toLocaleString('en-IN'); }

function StructureModal({ open, onClose, existing }) {
  const qc = useQueryClient();
  const isEdit = !!existing;

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: existing ? {
      name:          existing.name,
      description:   existing.description || '',
      academicYearId: existing.academicYearId?._id || '',
      classId:        existing.classId?._id || '',
      items: existing.items.map(i => ({
        head: i.head, amount: i.amount, frequency: i.frequency, isOptional: i.isOptional,
      })),
    } : {
      name: '', description: '', academicYearId: '', classId: '',
      items: [{ head: '', amount: '', frequency: 'annual', isOptional: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const { data: years }   = useQuery({ queryKey: ['academic-years'],  queryFn: () => api.get('/academics/years').then(r => r.data.data), staleTime: 300_000 });
  const { data: classes } = useQuery({ queryKey: ['classes'],         queryFn: () => api.get('/academics/classes').then(r => r.data.data), staleTime: 300_000 });

  const items = watch('items') ?? [];
  const total = items.filter(i => !i.isOptional).reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/fees/structures/${existing._id}`, body).then(r => r.data)
      : api.post('/fees/structures', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-structures'] });
      toast.success(isEdit ? 'Structure updated' : 'Structure created');
      onClose();
      reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      items: data.items.map(i => ({ ...i, amount: Number(i.amount) })),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-2xl">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit' : 'New'} Fee Structure</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="form-label">Structure Name *</label>
                <input {...register('name',{required:true})} className="form-input" placeholder="e.g. Tuition Fee — Class 10"/>
                {errors.name && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <select {...register('academicYearId')} className="form-select">
                  <option value="">All years</option>
                  {(years ?? []).map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Class (leave blank = school-wide)</label>
                <select {...register('classId')} className="form-select">
                  <option value="">All classes</option>
                  {(classes ?? []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group sm:col-span-2">
                <label className="form-label">Description</label>
                <textarea {...register('description')} className="form-textarea" rows={2}/>
              </div>
            </div>

            {/* Fee items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700">Fee Items</p>
                <button type="button" onClick={() => append({ head:'', amount:'', frequency:'annual', isOptional:false })}
                  className="btn btn-ghost btn-xs">
                  <Plus size={13}/> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {fields.map((f, idx) => (
                  <div key={f.id} className="grid grid-cols-12 gap-2 items-center rounded-lg border border-slate-200 p-2">
                    <GripVertical size={13} className="col-span-1 text-slate-300 mx-auto"/>
                    <input {...register(`items.${idx}.head`,{required:true})} className="form-input col-span-3 text-sm py-1.5" placeholder="Fee head"/>
                    <input {...register(`items.${idx}.amount`,{required:true,min:0})} type="number" className="form-input col-span-2 text-sm py-1.5" placeholder="₹"/>
                    <select {...register(`items.${idx}.frequency`)} className="form-select col-span-3 text-sm py-1.5">
                      {Object.entries(FREQ_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <label className="col-span-2 flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" {...register(`items.${idx}.isOptional`)} className="form-checkbox"/>
                      Optional
                    </label>
                    <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1}
                      className="col-span-1 btn-icon text-red-400 hover:text-red-600 disabled:opacity-30">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <div className="bg-slate-50 rounded-lg px-4 py-2 text-sm">
                  <span className="text-slate-500">Mandatory Total: </span>
                  <span className="font-bold text-slate-800">{fmt(total)}</span>
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Create Structure'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function GenerateInvoicesModal({ open, onClose, structure }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { period: '', dueDate: '', classId: '', sectionId: '' },
  });
  const { data: classes }  = useQuery({ queryKey: ['classes'],  queryFn: () => api.get('/academics/classes').then(r=>r.data.data), staleTime:300_000 });

  const mutation = useMutation({
    mutationFn: (body) => api.post('/fees/invoices/generate', body).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fee-invoices'] });
      toast.success(`Created ${data.data.created} invoices, skipped ${data.data.skipped}`);
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => {
    mutation.mutate({ feeStructureId: structure._id, academicYearId: structure.academicYearId?._id, ...data });
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-md">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Generate Invoices</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-700">{structure?.name}</p>
              <p className="text-slate-500 text-xs">{fmt(structure?.totalAmount)} • {structure?.classId?.name ?? 'All classes'}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Period *</label>
              <input {...register('period',{required:true})} className="form-input" placeholder="e.g. April 2025 or Q1-2025"/>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input type="date" {...register('dueDate',{required:true})} className="form-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Class (optional)</label>
              <select {...register('classId')} className="form-select">
                <option value="">All classes</option>
                {(classes ?? []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Generating…' : 'Generate Invoices'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function FeeStructuresPage() {
  const qc = useQueryClient();
  const [modal,   setModal]   = useState(null);
  const [genFor,  setGenFor]  = useState(null);
  const [expanded, setExpanded] = useState({});

  const { data: structures = [], isLoading } = useQuery({
    queryKey: ['fee-structures'],
    queryFn:  () => api.get('/fees/structures').then(r => r.data.data),
    staleTime: 30_000,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/fees/structures/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fee-structures'] }); toast.success('Deleted'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Structures</h1>
          <p className="page-subtitle">Define fee heads and generate invoices for students</p>
        </div>
        <button onClick={() => setModal('new')} className="btn btn-primary btn-md">
          <Plus size={15}/> New Structure
        </button>
      </div>

      {isLoading
        ? <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-20 rounded-xl"/>)}</div>
        : structures.length === 0
          ? (
            <div className="card card-body text-center py-16 text-slate-400">
              <p className="font-medium">No fee structures yet.</p>
              <p className="text-sm mt-1">Create one to start generating invoices.</p>
            </div>
          )
          : (
            <div className="space-y-3">
              {structures.map(s => (
                <div key={s._id} className="card overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        {s.classId && <span className="badge badge-primary text-xs">{s.classId.name}</span>}
                        {s.academicYearId && <span className="badge badge-slate text-xs">{s.academicYearId.name}</span>}
                        {!s.isActive && <span className="badge badge-error text-xs">Inactive</span>}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {s.items.length} items · Mandatory: <strong>{fmt(s.totalAmount)}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setGenFor(s)} className="btn btn-ghost btn-sm text-emerald-600 hover:bg-emerald-50">
                        Generate Invoices
                      </button>
                      <button onClick={() => setModal(s)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={14}/></button>
                      <button onClick={() => deleteMut.mutate(s._id)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                      <button onClick={() => toggleExpand(s._id)} className="btn-icon text-slate-400">
                        {expanded[s._id] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </button>
                    </div>
                  </div>

                  {expanded[s._id] && (
                    <div className="border-t border-slate-100">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Fee Head</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Frequency</th>
                            <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500">Amount</th>
                            <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500">Optional</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.items.map((item, idx) => (
                            <tr key={idx} className="border-t border-slate-100">
                              <td className="px-4 py-2 text-sm text-slate-700">{item.head}</td>
                              <td className="px-4 py-2">
                                <span className={`badge text-xs ${FREQ_COLOR[item.frequency] ?? 'badge-slate'}`}>{FREQ_LABEL[item.frequency]}</span>
                              </td>
                              <td className="px-4 py-2 text-sm font-medium text-slate-800 text-right">{fmt(item.amount)}</td>
                              <td className="px-4 py-2 text-center text-xs text-slate-400">{item.isOptional ? '✓' : '—'}</td>
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

      <StructureModal
        open={!!modal}
        onClose={() => setModal(null)}
        existing={modal && modal !== 'new' ? modal : null}
      />
      {genFor && (
        <GenerateInvoicesModal
          open={!!genFor}
          onClose={() => setGenFor(null)}
          structure={genFor}
        />
      )}
    </div>
  );
}
