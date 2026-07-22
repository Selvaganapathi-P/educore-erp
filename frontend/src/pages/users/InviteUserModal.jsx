import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import api from '../../lib/axios';

const ROLES = [
  'school_admin','principal','vice_principal','teacher','student','parent',
  'hr','receptionist','accountant','librarian','transport_manager',
  'hostel_warden','store_manager','nurse','counselor','security_guard','it_administrator',
];

const schema = z.object({
  email:      z.string().email('Valid email required'),
  role:       z.enum(ROLES, { errorMap: () => ({ message: 'Select a role' }) }),
  firstName:  z.string().min(1, 'First name required'),
  lastName:   z.string().min(1, 'Last name required'),
  phone:      z.string().optional(),
});

export function InviteUserModal({ open, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mut = useMutation({
    mutationFn: data => api.post('/users/invite', {
      email: data.email,
      role:  data.role,
      profile: { firstName: data.firstName, lastName: data.lastName, phone: data.phone },
    }),
    onSuccess: (res) => {
      toast.success('Invite sent successfully');
      reset();
      onClose();
      qc.invalidateQueries(['users']);
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Invite failed'),
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

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Invite User" description="Send an invite link to a new team member">
      <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {field('firstName', 'First Name *')}
          {field('lastName',  'Last Name *')}
        </div>
        {field('email', 'Email Address *', { type: 'email', placeholder: 'user@school.edu' })}
        {field('phone', 'Phone', { type: 'tel', placeholder: '+91 …' })}

        <div>
          <label className="label">Role *</label>
          <select className={`input w-full ${errors.role ? 'input-error' : ''}`} {...register('role')}>
            <option value="">Select role…</option>
            {ROLES.map(r => (
              <option key={r} value={r}>
                {r.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
              </option>
            ))}
          </select>
          {errors.role && <p className="field-error">{errors.role.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => { reset(); onClose(); }} className="btn btn-outline btn-md">Cancel</button>
          <button type="submit" disabled={mut.isPending} className="btn btn-primary btn-md">
            {mut.isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <UserPlus size={15} />
            }
            Send Invite
          </button>
        </div>
      </form>
    </Modal>
  );
}
