import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import api from '../../lib/axios';

const schema = z.object({
  firstName:   z.string().min(1, 'Required'),
  lastName:    z.string().min(1, 'Required'),
  phone:       z.string().optional(),
  gender:      z.enum(['male','female','other','']).optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup:  z.string().optional(),
  address:     z.string().optional(),
});

export function EditUserModal({ user, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName:   user.profile?.firstName ?? '',
      lastName:    user.profile?.lastName  ?? '',
      phone:       user.profile?.phone     ?? '',
      gender:      user.profile?.gender    ?? '',
      dateOfBirth: user.profile?.dateOfBirth ? user.profile.dateOfBirth.slice(0,10) : '',
      bloodGroup:  user.profile?.bloodGroup ?? '',
      address:     user.profile?.address   ?? '',
    },
  });

  const mut = useMutation({
    mutationFn: data => api.put(`/users/${user._id}`, {
      profile: {
        firstName: data.firstName, lastName: data.lastName, phone: data.phone,
        gender: data.gender || undefined, dateOfBirth: data.dateOfBirth || undefined,
        bloodGroup: data.bloodGroup || undefined, address: data.address || undefined,
      },
    }),
    onSuccess: () => { toast.success('User updated'); onClose(); qc.invalidateQueries(['users']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Update failed'),
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
    <Modal open={!!user} onClose={onClose} title="Edit User Profile">
      <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {field('firstName', 'First Name *')}
          {field('lastName',  'Last Name *')}
        </div>
        {field('phone', 'Phone', { type: 'tel' })}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Gender</label>
            <select className="input w-full" {...register('gender')}>
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {field('dateOfBirth', 'Date of Birth', { type: 'date' })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Blood Group</label>
            <select className="input w-full" {...register('bloodGroup')}>
              <option value="">—</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          {field('address', 'Address')}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-outline btn-md">Cancel</button>
          <button type="submit" disabled={mut.isPending} className="btn btn-primary btn-md">
            {mut.isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={15} />
            }
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
