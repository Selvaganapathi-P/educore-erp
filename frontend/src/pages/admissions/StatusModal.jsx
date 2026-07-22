import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import api from '../../lib/axios';

const STATUS_LABELS = {
  applied:              'Mark as Applied',
  documents_pending:    'Request Documents',
  under_review:         'Move to Review',
  interview_scheduled:  'Schedule Interview',
  approved:             'Approve Application',
  waitlisted:           'Add to Waitlist',
  rejected:             'Reject Application',
};

export function StatusModal({ applicationId, targetStatus, currentStatus, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm();
  const needsInterviewDate  = targetStatus === 'interview_scheduled';
  const needsRejectionReason= targetStatus === 'rejected';
  const needsWaitlistPos    = targetStatus === 'waitlisted';

  const mut = useMutation({
    mutationFn: data => api.patch(`/admissions/${applicationId}/status`, {
      status:           targetStatus,
      note:             data.note,
      interviewDate:    data.interviewDate,
      rejectionReason:  data.rejectionReason,
      waitlistPosition: data.waitlistPosition ? Number(data.waitlistPosition) : undefined,
    }),
    onSuccess: () => {
      toast.success(`Status updated to ${targetStatus.replace(/_/g,' ')}`);
      qc.invalidateQueries(['admission', applicationId]);
      qc.invalidateQueries(['admissions']);
      qc.invalidateQueries(['admission-stats']);
      onClose();
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Update failed'),
  });

  return (
    <Modal open size="sm" onClose={onClose} title={STATUS_LABELS[targetStatus] ?? 'Update Status'}>
      <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="badge badge-slate capitalize">{currentStatus.replace(/_/g,' ')}</span>
          <ArrowRight size={14} className="text-slate-400" />
          <span className="badge badge-primary capitalize">{targetStatus.replace(/_/g,' ')}</span>
        </div>

        {needsInterviewDate && (
          <div>
            <label className="label">Interview Date & Time *</label>
            <input type="datetime-local" className="input w-full" {...register('interviewDate', { required: true })} />
          </div>
        )}

        {needsRejectionReason && (
          <div>
            <label className="label">Rejection Reason</label>
            <textarea className="input w-full" rows={3} placeholder="Reason for rejection…" {...register('rejectionReason')} />
          </div>
        )}

        {needsWaitlistPos && (
          <div>
            <label className="label">Waitlist Position</label>
            <input type="number" min={1} className="input w-full" {...register('waitlistPosition')} />
          </div>
        )}

        <div>
          <label className="label">Note (optional)</label>
          <textarea className="input w-full" rows={2} placeholder="Add a note…" {...register('note')} />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-outline btn-md">Cancel</button>
          <button type="submit" disabled={mut.isPending}
            className={`btn btn-md ${targetStatus === 'rejected' ? 'btn-danger' : 'btn-primary'}`}>
            {mut.isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : null
            }
            Confirm
          </button>
        </div>
      </form>
    </Modal>
  );
}
