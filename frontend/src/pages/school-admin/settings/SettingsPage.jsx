import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as Tabs from '@radix-ui/react-tabs';
import { BookOpen, Clock, CreditCard, Bell, Save } from 'lucide-react';
import api from '../../../lib/axios';

const TABS = [
  { id: 'academic',      label: 'Academic',       icon: BookOpen },
  { id: 'attendance',    label: 'Attendance',      icon: Clock    },
  { id: 'fees',          label: 'Fees',            icon: CreditCard },
  { id: 'notifications', label: 'Notifications',   icon: Bell     },
];

function useSettings() {
  return useQuery({
    queryKey: ['school-settings'],
    queryFn:  () => api.get('/settings').then(r => r.data.data),
  });
}

export default function SettingsPage() {
  const [tab, setTab] = useState('academic');
  const { data: settings, isLoading } = useSettings();

  if (isLoading) return <div className="space-y-4">{Array.from({length:3}).map((_,i)=><div key={i} className="card card-body"><div className="skeleton h-20 rounded"/></div>)}</div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">School Settings</h1>
      </div>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Tabs.Trigger
              key={id} value={id}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all
                data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700
                text-slate-500 hover:text-slate-700"
            >
              <Icon size={15} />{label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="academic">
          <AcademicSettings data={settings?.academic} />
        </Tabs.Content>
        <Tabs.Content value="attendance">
          <AttendanceSettings data={settings?.attendance} />
        </Tabs.Content>
        <Tabs.Content value="fees">
          <FeeSettings data={settings?.fees} />
        </Tabs.Content>
        <Tabs.Content value="notifications">
          <NotificationSettings data={settings?.notifications} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function SectionForm({ section, data, fields }) {
  const qc   = useQueryClient();
  const { register, handleSubmit, formState: { isDirty } } = useForm({ defaultValues: data ?? {} });

  const mut = useMutation({
    mutationFn: body => api.patch(`/settings/${section}`, body),
    onSuccess: () => { toast.success('Settings saved'); qc.invalidateQueries(['school-settings']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  return (
    <form onSubmit={handleSubmit(d => mut.mutate(d))} className="card card-body space-y-4 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.name}>
            <label className="label">{f.label}</label>
            {f.type === 'checkbox'
              ? <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register(f.name)} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm text-slate-600">{f.checkLabel ?? 'Enabled'}</span>
                </label>
              : <input
                  type={f.type ?? 'text'}
                  step={f.step}
                  className="input w-full"
                  placeholder={f.placeholder}
                  {...register(f.name, { valueAsNumber: f.type === 'number' })}
                />
            }
            {f.hint && <p className="field-hint">{f.hint}</p>}
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={mut.isPending || !isDirty} className="btn btn-primary btn-md">
          {mut.isPending
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save size={15} />
          }
          Save
        </button>
      </div>
    </form>
  );
}

function AcademicSettings({ data }) {
  return <SectionForm section="academic" data={data} fields={[
    { name: 'currentAcademicYear', label: 'Current Academic Year', placeholder: '2024-25' },
    { name: 'schoolStartTime',     label: 'School Start Time', type: 'time' },
    { name: 'schoolEndTime',       label: 'School End Time',   type: 'time' },
    { name: 'periodsPerDay',       label: 'Periods Per Day',   type: 'number' },
    { name: 'periodDuration',      label: 'Period Duration (mins)', type: 'number' },
  ]} />;
}

function AttendanceSettings({ data }) {
  return <SectionForm section="attendance" data={data} fields={[
    { name: 'lateThreshold',   label: 'Late Threshold (mins)', type: 'number', hint: 'Minutes after start time' },
    { name: 'minimumRequired', label: 'Minimum Required (%)',  type: 'number' },
    { name: 'autoAbsent',      label: 'Auto-mark Absent', type: 'checkbox', checkLabel: 'Automatically mark absent if not marked present' },
  ]} />;
}

function FeeSettings({ data }) {
  return <SectionForm section="fees" data={data} fields={[
    { name: 'currency',          label: 'Currency',            placeholder: 'INR' },
    { name: 'lateFineEnabled',   label: 'Late Fine',  type: 'checkbox', checkLabel: 'Enable late payment fine' },
    { name: 'lateFineAmount',    label: 'Fine Amount', type: 'number' },
    { name: 'lateFineAfterDays', label: 'Fine After (days)', type: 'number' },
    { name: 'receiptPrefix',     label: 'Receipt Prefix', placeholder: 'REC' },
    { name: 'invoicePrefix',     label: 'Invoice Prefix', placeholder: 'INV' },
  ]} />;
}

function NotificationSettings({ data }) {
  return <SectionForm section="notifications" data={data} fields={[
    { name: 'emailEnabled',    label: 'Email',    type: 'checkbox', checkLabel: 'Enable email notifications' },
    { name: 'smsEnabled',      label: 'SMS',      type: 'checkbox', checkLabel: 'Enable SMS notifications' },
    { name: 'whatsappEnabled', label: 'WhatsApp', type: 'checkbox', checkLabel: 'Enable WhatsApp notifications' },
    { name: 'pushEnabled',     label: 'Push',     type: 'checkbox', checkLabel: 'Enable push notifications' },
    { name: 'smsProvider',     label: 'SMS Provider', placeholder: 'twilio, msg91, …' },
  ]} />;
}
