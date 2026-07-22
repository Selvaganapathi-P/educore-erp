import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Power, Building2, Mail, Phone, Globe, MapPin, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const STATUS_BADGE = {
  active:    'badge-success',
  trial:     'badge-primary',
  inactive:  'badge-slate',
  suspended: 'badge-danger',
};

export default function SchoolDetailPage() {
  const { id } = useParams();
  const qc     = useQueryClient();

  const { data: school, isLoading } = useQuery({
    queryKey: ['school', id],
    queryFn:  () => api.get(`/schools/${id}`).then(r => r.data.data),
  });

  const statusMut = useMutation({
    mutationFn: ({ status }) => api.patch(`/schools/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['school', id]); },
    onError: e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card card-body"><div className="skeleton h-24 rounded" /></div>
        ))}
      </div>
    );
  }

  if (!school) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header flex-wrap gap-3">
        <div>
          <Link to="/super-admin/schools" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-1">
            <ArrowLeft size={14} /> Schools
          </Link>
          <h1 className="page-title">{school.name}</h1>
          <p className="page-subtitle">{school.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => statusMut.mutate({ status: school.status === 'suspended' ? 'active' : 'suspended' })}
            disabled={statusMut.isPending}
            className="btn btn-outline btn-md"
          >
            <Power size={15} /> {school.status === 'suspended' ? 'Reactivate' : 'Suspend'}
          </button>
          <Link to={`/super-admin/schools/${id}/edit`} className="btn btn-primary btn-md">
            <Edit2 size={15} /> Edit
          </Link>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard icon={Building2} label="Type" value={school.type?.replace(/_/g,' ') ?? '—'} />
        <InfoCard icon={Calendar}  label="Created" value={dayjs(school.createdAt).format('DD MMM YYYY')} />
        <div className="card card-body flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Power size={18} className="text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Status</p>
            <span className={`badge ${STATUS_BADGE[school.status] ?? 'badge-slate'} capitalize`}>{school.status}</span>
          </div>
        </div>
      </div>

      {/* Contact & Address */}
      <div className="card card-body space-y-3">
        <h2 className="font-semibold text-slate-700">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Detail icon={Mail}  label="Email"   value={school.email} />
          <Detail icon={Phone} label="Phone"   value={school.phone} />
          <Detail icon={Globe} label="Website" value={school.website ?? '—'} />
          <Detail icon={MapPin} label="Address"
            value={[school.address?.street, school.address?.city, school.address?.state, school.address?.pincode].filter(Boolean).join(', ') || '—'}
          />
        </div>
      </div>

      {/* Subscription */}
      <div className="card card-body space-y-3">
        <h2 className="font-semibold text-slate-700">Subscription</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-slate-500">Plan</p><p className="font-medium capitalize">{school.subscriptionPlan}</p></div>
          <div><p className="text-slate-500">Storage Used</p><p className="font-medium">{((school.storageUsed ?? 0) / 1e6).toFixed(1)} MB</p></div>
          <div><p className="text-slate-500">Storage Limit</p><p className="font-medium">{((school.storageLimit ?? 0) / 1e9).toFixed(1)} GB</p></div>
          {school.trialEndDate && (
            <div>
              <p className="text-slate-500">Trial Ends</p>
              <p className="font-medium">{dayjs(school.trialEndDate).format('DD MMM YYYY')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="card card-body flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
        <Icon size={18} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="font-semibold text-slate-800 capitalize">{value}</p>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={15} className="text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
