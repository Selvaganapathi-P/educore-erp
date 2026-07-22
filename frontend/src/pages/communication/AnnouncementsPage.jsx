import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Megaphone, Globe, Users, School, Pencil, Trash2, Send, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

dayjs.extend(relativeTime);

const TYPE_CONFIG = {
  general:  { label: 'General',  color: 'badge-slate'   },
  event:    { label: 'Event',    color: 'badge-primary'  },
  urgent:   { label: 'Urgent',   color: 'badge-error'    },
  holiday:  { label: 'Holiday',  color: 'badge-success'  },
  exam:     { label: 'Exam',     color: 'badge-warning'  },
  fee:      { label: 'Fee',      color: 'badge-info'     },
};

const AUDIENCE_ICON = {
  all:     Globe,
  roles:   Users,
  classes: School,
};

const ADMIN_ROLES = ['super_admin','school_admin','principal','vice_principal'];
const STAFF_ROLES = [...ADMIN_ROLES, 'teacher','accountant','hr','librarian','nurse','receptionist'];

export default function AnnouncementsPage() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const user      = useAuthStore(s => s.user);
  const role      = user?.role || '';
  const isAdmin   = ADMIN_ROLES.includes(role);
  const canCreate = STAFF_ROLES.includes(role);

  const [typeFilter, setTypeFilter]   = useState('');
  const [showDrafts, setShowDrafts]   = useState(false);

  const params = { limit: 30 };
  if (typeFilter) params.type = typeFilter;
  if (isAdmin && showDrafts) params.isPublished = 'false';

  const { data, isLoading } = useQuery({
    queryKey: ['announcements', params],
    queryFn:  () => api.get('/communication/announcements', { params }).then(r => r.data),
    staleTime: 30_000,
  });

  const announcements = data?.data ?? [];

  const publishMut = useMutation({
    mutationFn: (id) => api.patch(`/communication/announcements/${id}/publish`).then(r => r.data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Published'); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/communication/announcements/${id}`).then(r => r.data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Deleted'); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">School-wide notices and updates</p>
        </div>
        {canCreate && (
          <button onClick={() => navigate('/communication/announcements/new')} className="btn btn-primary btn-md">
            <Plus size={15}/> New Announcement
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {[['','All Types'], ...Object.entries(TYPE_CONFIG).map(([v,c]) => [v,c.label])].map(([v,l]) => (
            <button key={v} onClick={() => setTypeFilter(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${typeFilter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
              {l}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button onClick={() => setShowDrafts(p => !p)}
            className={`ml-auto px-3 py-1 rounded-full text-xs font-medium border transition-colors ${showDrafts ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200'}`}>
            {showDrafts ? 'Showing Drafts' : 'Show Drafts'}
          </button>
        )}
      </div>

      {/* List */}
      {isLoading
        ? <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-32 rounded-xl"/>)}</div>
        : announcements.length === 0
          ? (
            <div className="card card-body text-center py-16 text-slate-400">
              <Megaphone size={36} className="mx-auto mb-3 text-slate-300"/>
              <p className="font-medium">No announcements</p>
              {canCreate && <p className="text-sm mt-1">Create one to broadcast to your school.</p>}
            </div>
          )
          : (
            <div className="space-y-3">
              {announcements.map(ann => {
                const cfg       = TYPE_CONFIG[ann.type] ?? TYPE_CONFIG.general;
                const AudIcon   = AUDIENCE_ICON[ann.targetAudience] ?? Globe;
                const isDraft   = !ann.isPublished;
                const isExpired = ann.expiresAt && dayjs(ann.expiresAt).isBefore(dayjs());

                return (
                  <div key={ann._id} className={`card card-body transition-shadow hover:shadow-md ${isDraft ? 'border border-dashed border-slate-300 opacity-75' : ''} ${isExpired ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      {/* Type dot */}
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${ann.type === 'urgent' ? 'bg-red-500' : ann.type === 'event' ? 'bg-primary-500' : ann.type === 'holiday' ? 'bg-emerald-500' : 'bg-slate-400'}`}/>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                              {isDraft && <span className="badge badge-slate text-xs"><Clock size={9} className="inline mr-0.5"/>Draft</span>}
                              {isExpired && <span className="badge badge-error text-xs">Expired</span>}
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <AudIcon size={11}/> {ann.targetAudience}
                              </span>
                            </div>
                            <h3 className="font-semibold text-slate-800 text-base leading-snug">{ann.title}</h3>
                          </div>

                          {/* Actions */}
                          {(isAdmin || String(ann.createdBy?._id) === String(user?._id)) && (
                            <div className="flex items-center gap-1 shrink-0">
                              {isDraft && isAdmin && (
                                <button onClick={() => publishMut.mutate(ann._id)}
                                  disabled={publishMut.isPending}
                                  className="btn btn-ghost btn-xs text-emerald-600 hover:bg-emerald-50">
                                  <Send size={11}/> Publish
                                </button>
                              )}
                              <button onClick={() => navigate(`/communication/announcements/${ann._id}/edit`)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={13}/></button>
                              {isAdmin && (
                                <button onClick={() => deleteMut.mutate(ann._id)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 mt-1.5 line-clamp-3 whitespace-pre-wrap">{ann.content}</p>

                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                          <span>
                            {ann.createdBy?.profile?.firstName} {ann.createdBy?.profile?.lastName}
                          </span>
                          <span>·</span>
                          <span>{ann.publishedAt ? dayjs(ann.publishedAt).fromNow() : dayjs(ann.createdAt).fromNow()}</span>
                          {ann.expiresAt && (
                            <>
                              <span>·</span>
                              <span>Expires {dayjs(ann.expiresAt).format('DD MMM YYYY')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
      }
    </div>
  );
}
