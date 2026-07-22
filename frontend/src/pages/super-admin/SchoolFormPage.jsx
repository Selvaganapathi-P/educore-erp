import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../lib/axios';

const schema = z.object({
  name:             z.string().min(2, 'Name is required'),
  email:            z.string().email('Valid email required'),
  phone:            z.string().min(7, 'Phone required'),
  type:             z.enum(['primary','secondary','higher_secondary','k12','university']),
  board:            z.string().optional(),
  website:          z.string().url('Enter a valid URL').optional().or(z.literal('')),
  subscriptionPlan: z.enum(['free','basic','standard','premium','enterprise']),
  trialDays:        z.coerce.number().int().min(0).max(90),
  'address.street': z.string().optional(),
  'address.city':   z.string().optional(),
  'address.state':  z.string().optional(),
  'address.pincode':z.string().optional(),
});

export default function SchoolFormPage() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const qc      = useQueryClient();
  const isEdit  = !!id;

  const { data: school } = useQuery({
    queryKey: ['school', id],
    queryFn:  () => api.get(`/schools/${id}`).then(r => r.data.data),
    enabled:  isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'k12', subscriptionPlan: 'free', trialDays: 14 },
  });

  useEffect(() => {
    if (school) {
      reset({
        name: school.name, email: school.email, phone: school.phone,
        type: school.type, board: school.board ?? '', website: school.website ?? '',
        subscriptionPlan: school.subscriptionPlan, trialDays: school.trialDays ?? 14,
        'address.street': school.address?.street ?? '',
        'address.city':   school.address?.city   ?? '',
        'address.state':  school.address?.state  ?? '',
        'address.pincode':school.address?.pincode ?? '',
      });
    }
  }, [school, reset]);

  const mut = useMutation({
    mutationFn: data => {
      const payload = {
        name: data.name, email: data.email, phone: data.phone,
        type: data.type, board: data.board, website: data.website,
        subscriptionPlan: data.subscriptionPlan, trialDays: data.trialDays,
        address: {
          street: data['address.street'], city: data['address.city'],
          state:  data['address.state'],  pincode: data['address.pincode'],
        },
      };
      return isEdit
        ? api.put(`/schools/${id}`, payload)
        : api.post('/schools', payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'School updated' : 'School created');
      qc.invalidateQueries(['schools']);
      nav('/super-admin/schools');
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  function field(name, label, opts = {}) {
    const err = errors[name];
    return (
      <div>
        <label className="label">{label}</label>
        <input className={`input w-full ${err ? 'input-error' : ''}`} {...register(name)} {...opts} />
        {err && <p className="field-error">{err.message}</p>}
      </div>
    );
  }

  function select(name, label, options) {
    const err = errors[name];
    return (
      <div>
        <label className="label">{label}</label>
        <select className={`input w-full ${err ? 'input-error' : ''}`} {...register(name)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {err && <p className="field-error">{err.message}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-1">
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title">{isEdit ? 'Edit School' : 'Add New School'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
        {/* Basic info */}
        <div className="card card-body space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('name',  'School Name *')}
            {field('email', 'Email *', { type: 'email' })}
            {field('phone', 'Phone *', { type: 'tel' })}
            {field('website', 'Website', { placeholder: 'https://' })}
            {select('type', 'School Type *', [
              { value: 'k12',             label: 'K-12' },
              { value: 'primary',         label: 'Primary' },
              { value: 'secondary',       label: 'Secondary' },
              { value: 'higher_secondary',label: 'Higher Secondary' },
              { value: 'university',      label: 'University' },
            ])}
            {field('board', 'Board / Affiliation', { placeholder: 'CBSE, ICSE, State…' })}
          </div>
        </div>

        {/* Address */}
        <div className="card card-body space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('address.street', 'Street')}
            {field('address.city',   'City')}
            {field('address.state',  'State')}
            {field('address.pincode','Pincode')}
          </div>
        </div>

        {/* Subscription */}
        <div className="card card-body space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Subscription</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {select('subscriptionPlan', 'Plan', [
              { value: 'free',       label: 'Free' },
              { value: 'basic',      label: 'Basic' },
              { value: 'standard',   label: 'Standard' },
              { value: 'premium',    label: 'Premium' },
              { value: 'enterprise', label: 'Enterprise' },
            ])}
            {field('trialDays', 'Trial Days', { type: 'number', min: 0, max: 90 })}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => nav(-1)} className="btn btn-outline btn-md">Cancel</button>
          <button type="submit" disabled={mut.isPending} className="btn btn-primary btn-md">
            {mut.isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={15} />
            }
            {isEdit ? 'Save Changes' : 'Create School'}
          </button>
        </div>
      </form>
    </div>
  );
}
