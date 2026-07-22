import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User, Users, BookOpen, MapPin } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import api from '../../lib/axios';

const schema = z.object({
  // Student
  firstName:        z.string().min(1, 'Required'),
  lastName:         z.string().min(1, 'Required'),
  dateOfBirth:      z.string().min(1, 'Required'),
  gender:           z.enum(['male','female','other']),
  bloodGroup:       z.string().optional(),
  category:         z.enum(['general','obc','sc','st','ews','other']).default('general'),
  motherTongue:     z.string().optional(),
  nationality:      z.string().default('Indian'),
  // Academic
  applyingForClass: z.string().min(1, 'Required'),
  applyingForYear:  z.string().min(1, 'Required'),
  prevSchoolName:   z.string().optional(),
  prevClass:        z.string().optional(),
  prevBoard:        z.string().optional(),
  prevPercentage:   z.coerce.number().optional(),
  // Father
  fatherName:   z.string().optional(),
  fatherPhone:  z.string().optional(),
  fatherEmail:  z.string().email().optional().or(z.literal('')),
  fatherOccupation: z.string().optional(),
  // Mother
  motherName:   z.string().optional(),
  motherPhone:  z.string().optional(),
  motherEmail:  z.string().email().optional().or(z.literal('')),
  motherOccupation: z.string().optional(),
  // Address
  street:  z.string().optional(),
  city:    z.string().optional(),
  state:   z.string().optional(),
  pincode: z.string().optional(),
  // Meta
  source:    z.enum(['walk_in','online','referral','campaign','other']).default('online'),
  notes:     z.string().optional(),
  admissionFee: z.coerce.number().min(0).default(0),
});

const CURRENT_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

export default function AdmissionFormPage() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const qc      = useQueryClient();
  const isEdit  = !!id;

  const { data: existing } = useQuery({
    queryKey: ['admission', id],
    queryFn:  () => api.get(`/admissions/${id}`).then(r => r.data.data),
    enabled:  isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'male', category: 'general', source: 'online', applyingForYear: CURRENT_YEAR, nationality: 'Indian', admissionFee: 0 },
  });

  useEffect(() => {
    if (existing) {
      reset({
        firstName: existing.student.firstName, lastName: existing.student.lastName,
        dateOfBirth: existing.student.dateOfBirth?.slice(0,10), gender: existing.student.gender,
        bloodGroup: existing.student.bloodGroup ?? '', category: existing.student.category,
        motherTongue: existing.student.motherTongue ?? '', nationality: existing.student.nationality,
        applyingForClass: existing.applyingForClass, applyingForYear: existing.applyingForYear,
        prevSchoolName: existing.previousSchool?.name ?? '', prevClass: existing.previousSchool?.class ?? '',
        prevBoard: existing.previousSchool?.board ?? '', prevPercentage: existing.previousSchool?.percentage ?? '',
        fatherName: existing.father?.name ?? '', fatherPhone: existing.father?.phone ?? '',
        fatherEmail: existing.father?.email ?? '', fatherOccupation: existing.father?.occupation ?? '',
        motherName: existing.mother?.name ?? '', motherPhone: existing.mother?.phone ?? '',
        motherEmail: existing.mother?.email ?? '', motherOccupation: existing.mother?.occupation ?? '',
        street: existing.address?.street ?? '', city: existing.address?.city ?? '',
        state: existing.address?.state ?? '', pincode: existing.address?.pincode ?? '',
        source: existing.source, notes: existing.notes ?? '', admissionFee: existing.admissionFee,
      });
    }
  }, [existing, reset]);

  const mut = useMutation({
    mutationFn: data => {
      const payload = {
        student: { firstName: data.firstName, lastName: data.lastName, dateOfBirth: data.dateOfBirth,
          gender: data.gender, bloodGroup: data.bloodGroup, category: data.category,
          motherTongue: data.motherTongue, nationality: data.nationality },
        applyingForClass: data.applyingForClass,
        applyingForYear:  data.applyingForYear,
        previousSchool: { name: data.prevSchoolName, class: data.prevClass, board: data.prevBoard, percentage: data.prevPercentage },
        father: { name: data.fatherName, phone: data.fatherPhone, email: data.fatherEmail, occupation: data.fatherOccupation },
        mother: { name: data.motherName, phone: data.motherPhone, email: data.motherEmail, occupation: data.motherOccupation },
        address: { street: data.street, city: data.city, state: data.state, pincode: data.pincode },
        source: data.source, notes: data.notes, admissionFee: data.admissionFee,
      };
      return isEdit ? api.put(`/admissions/${id}`, payload) : api.post('/admissions', payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Application updated' : 'Application created');
      qc.invalidateQueries(['admissions']); qc.invalidateQueries(['admission-stats']);
      nav('/admissions');
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  const F = ({ name, label, opts = {} }) => {
    const err = errors[name];
    return (
      <div>
        <label className="label">{label}</label>
        <input className={`input w-full ${err ? 'input-error' : ''}`} {...register(name)} {...opts} />
        {err && <p className="field-error">{err.message}</p>}
      </div>
    );
  };

  const S = ({ name, label, options }) => {
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
  };

  const TABS_DEF = [
    { id: 'student',  label: 'Student Info',   icon: User    },
    { id: 'academic', label: 'Academic',        icon: BookOpen },
    { id: 'parents',  label: 'Parents',         icon: Users   },
    { id: 'address',  label: 'Address & Meta',  icon: MapPin  },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-1">
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Application' : 'New Admission Application'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => mut.mutate(d))}>
        <Tabs.Root defaultValue="student">
          <Tabs.List className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-4">
            {TABS_DEF.map(({ id, label, icon: Icon }) => (
              <Tabs.Trigger key={id} value={id}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all
                  data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700
                  text-slate-500 hover:text-slate-700">
                <Icon size={14} />{label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="student">
            <div className="card card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F name="firstName" label="First Name *" />
              <F name="lastName"  label="Last Name *" />
              <F name="dateOfBirth" label="Date of Birth *" opts={{ type: 'date' }} />
              <S name="gender" label="Gender *" options={[
                { value: 'male', label: 'Male' },{ value: 'female', label: 'Female' },{ value: 'other', label: 'Other' },
              ]} />
              <S name="category" label="Category" options={[
                { value: 'general', label: 'General' },{ value: 'obc', label: 'OBC' },
                { value: 'sc', label: 'SC' },{ value: 'st', label: 'ST' },
                { value: 'ews', label: 'EWS' },{ value: 'other', label: 'Other' },
              ]} />
              <div>
                <label className="label">Blood Group</label>
                <select className="input w-full" {...register('bloodGroup')}>
                  <option value="">—</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <F name="motherTongue" label="Mother Tongue" />
              <F name="nationality"  label="Nationality" />
            </div>
          </Tabs.Content>

          <Tabs.Content value="academic">
            <div className="card card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F name="applyingForClass" label="Applying for Class *" opts={{ placeholder: 'e.g. Grade 5' }} />
              <F name="applyingForYear"  label="Academic Year *"      opts={{ placeholder: '2024-25' }} />
              <div className="sm:col-span-2"><div className="divider my-0" /></div>
              <F name="prevSchoolName"  label="Previous School Name" />
              <F name="prevClass"       label="Class Passed" />
              <F name="prevBoard"       label="Board / Affiliation" />
              <F name="prevPercentage"  label="Percentage / Grade"   opts={{ type: 'number', step: '0.01' }} />
            </div>
          </Tabs.Content>

          <Tabs.Content value="parents">
            <div className="space-y-4">
              <div className="card card-body">
                <h3 className="font-semibold text-slate-700 mb-4">Father's Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <F name="fatherName"       label="Full Name" />
                  <F name="fatherPhone"      label="Phone"    opts={{ type: 'tel' }} />
                  <F name="fatherEmail"      label="Email"    opts={{ type: 'email' }} />
                  <F name="fatherOccupation" label="Occupation" />
                </div>
              </div>
              <div className="card card-body">
                <h3 className="font-semibold text-slate-700 mb-4">Mother's Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <F name="motherName"       label="Full Name" />
                  <F name="motherPhone"      label="Phone"    opts={{ type: 'tel' }} />
                  <F name="motherEmail"      label="Email"    opts={{ type: 'email' }} />
                  <F name="motherOccupation" label="Occupation" />
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="address">
            <div className="card card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><F name="street" label="Street Address" /></div>
              <F name="city"    label="City" />
              <F name="state"   label="State" />
              <F name="pincode" label="Pincode" />
              <S name="source" label="Application Source" options={[
                { value: 'online',   label: 'Online Portal'  },
                { value: 'walk_in',  label: 'Walk-in'        },
                { value: 'referral', label: 'Referral'       },
                { value: 'campaign', label: 'Campaign'       },
                { value: 'other',    label: 'Other'          },
              ]} />
              <F name="admissionFee" label="Application Fee (₹)" opts={{ type: 'number', min: 0 }} />
              <div className="sm:col-span-2">
                <label className="label">Notes</label>
                <textarea className="input w-full" rows={3} {...register('notes')} />
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => nav(-1)} className="btn btn-outline btn-md">Cancel</button>
          <button type="submit" disabled={mut.isPending} className="btn btn-primary btn-md">
            {mut.isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={15} />
            }
            {isEdit ? 'Save Changes' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
