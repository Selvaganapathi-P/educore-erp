import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Award, Plus, X, Search, UserCheck, Printer, Trash2, Eye, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const CERT_TYPES = ['bonafide','character','transfer','participation','merit','experience','other'];
const CERT_COLORS = { bonafide:'badge-primary', character:'badge-info', transfer:'badge-warning', participation:'badge-success', merit:'badge-error', experience:'badge-primary', other:'badge-default' };

const CERT_TEMPLATES = {
  bonafide:      { label: 'Bonafide Certificate',      fields: ['purpose','classSection','academicYear'] },
  character:     { label: 'Character Certificate',     fields: ['purpose','classSection','academicYear','conductRemark'] },
  transfer:      { label: 'Transfer Certificate',      fields: ['classSection','academicYear','lastDate','reason'] },
  participation: { label: 'Participation Certificate', fields: ['eventName','eventDate','role'] },
  merit:         { label: 'Merit Certificate',         fields: ['achievement','rank','subject'] },
  experience:    { label: 'Experience Certificate',    fields: ['designation','department','fromDate','toDate'] },
  other:         { label: 'Certificate',               fields: ['purpose'] },
};

function PrintCertificate({ cert, schoolName, onClose }) {
  const recipientName = (r) => {
    const p = r?.userId?.profile || r?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : r?.rollNumber || r?.employeeId || '—';
  };

  const issuerName = (u) => {
    const p = u?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : 'Principal';
  };

  const tmpl = CERT_TEMPLATES[cert.type] ?? CERT_TEMPLATES.other;
  const d    = cert.details ?? {};

  const certBody = () => {
    const name = recipientName(cert.recipientId);
    switch (cert.type) {
      case 'bonafide':
        return `This is to certify that <strong>${name}</strong> is a bonafide student of this institution${d.classSection ? `, studying in <strong>${d.classSection}</strong>` : ''}${d.academicYear ? ` for the academic year ${d.academicYear}` : ''}. This certificate is issued on request for the purpose of <strong>${d.purpose || '___________'}</strong>.`;
      case 'character':
        return `This is to certify that <strong>${name}</strong>${d.classSection ? `, of ${d.classSection}` : ''}, is known to us and bears a ${d.conductRemark || 'good'} character. They have been a disciplined and sincere student. This certificate is issued for ${d.purpose || 'general purpose'}.`;
      case 'transfer':
        return `This is to certify that <strong>${name}</strong> was a student of this institution${d.classSection ? ` in class <strong>${d.classSection}</strong>` : ''}${d.academicYear ? ` during the academic year ${d.academicYear}` : ''}. The student has been granted transfer from this institution${d.lastDate ? ` with effect from ${dayjs(d.lastDate).format('DD MMMM YYYY')}` : ''}${d.reason ? `. Reason: ${d.reason}` : ''}.`;
      case 'participation':
        return `This is to certify that <strong>${name}</strong> has actively participated in <strong>${d.eventName || '___________'}</strong>${d.eventDate ? ` held on ${dayjs(d.eventDate).format('DD MMMM YYYY')}` : ''}${d.role ? ` as <strong>${d.role}</strong>` : ''}. We wish them all the best for their future endeavours.`;
      case 'merit':
        return `This is to certify that <strong>${name}</strong> has achieved <strong>${d.achievement || 'outstanding performance'}</strong>${d.rank ? ` securing <strong>Rank ${d.rank}</strong>` : ''}${d.subject ? ` in ${d.subject}` : ''}. We appreciate their dedication and hard work.`;
      case 'experience':
        return `This is to certify that <strong>${name}</strong> served as <strong>${d.designation || '___________'}</strong>${d.department ? ` in the ${d.department} department` : ''}${d.fromDate && d.toDate ? ` from ${dayjs(d.fromDate).format('DD MMM YYYY')} to ${dayjs(d.toDate).format('DD MMM YYYY')}` : ''}. During this period, they demonstrated professionalism and commitment.`;
      default:
        return `This is to certify that <strong>${name}</strong> has ${d.purpose || 'satisfactorily fulfilled the requirements'}. This certificate is issued for record purposes.`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="font-semibold text-slate-700">Certificate Preview</p>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn btn-primary btn-sm"><Printer size={13}/> Print</button>
            <button onClick={onClose} className="btn-icon"><X size={16}/></button>
          </div>
        </div>

        {/* Print area */}
        <div id="cert-print" className="flex-1 overflow-y-auto p-6">
          <style>{`@media print { body > *:not(#cert-print) { display: none; } #cert-print { display: block !important; padding: 0; margin: 0; } .no-print { display: none !important; } }`}</style>
          <div className="border-4 border-double border-amber-500 rounded-2xl p-10 text-center space-y-6 min-h-96">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wide">{schoolName || 'School Name'}</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Affiliated School · Estd.</p>
            </div>

            <div className="w-16 h-0.5 bg-amber-500 mx-auto"/>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">Certificate of {cert.type === 'bonafide' ? 'Bonafide' : tmpl.label.replace(' Certificate','')}</p>
              <h2 className="text-3xl font-black text-amber-600 uppercase tracking-wide">{tmpl.label}</h2>
            </div>

            <p className="text-xs text-slate-400">No.: <strong>{cert.certNumber}</strong></p>

            <div className="text-slate-700 text-sm leading-relaxed text-justify max-w-lg mx-auto"
              dangerouslySetInnerHTML={{ __html: certBody() }}/>

            {cert.details?.additionalNote && (
              <p className="text-xs text-slate-500 italic">{cert.details.additionalNote}</p>
            )}

            <div className="w-16 h-0.5 bg-amber-500 mx-auto"/>

            <div className="flex justify-between items-end pt-8">
              <div className="text-left">
                <p className="text-xs text-slate-500">Date of Issue</p>
                <p className="text-sm font-semibold">{dayjs(cert.issuedDate).format('DD MMMM YYYY')}</p>
              </div>
              <div className="text-right">
                <div className="h-8 border-b border-slate-400 w-32 mb-1"/>
                <p className="text-xs font-semibold text-slate-700">{issuerName(cert.issuedBy)}</p>
                <p className="text-xs text-slate-500">Principal / Authorized Signatory</p>
              </div>
            </div>

            <p className="text-2xs text-slate-300 pt-2">This is a computer-generated certificate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueModal({ open, onClose }) {
  const qc = useQueryClient();
  const [recipientModel, setRecipientModel] = useState('Student');
  const [search,   setSearch]   = useState('');
  const [selRec,   setSelRec]   = useState(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: { recipientId:'', type:'bonafide', issuedDate: dayjs().format('YYYY-MM-DD'), purpose:'', additionalNote:'' },
  });

  const certType = watch('type');
  const tmpl     = CERT_TEMPLATES[certType] ?? CERT_TEMPLATES.other;

  const { data: searchRes = [] } = useQuery({
    queryKey: ['cert-recipient-search', recipientModel, search],
    queryFn:  () => {
      if (search.length < 2) return [];
      const url = recipientModel === 'Student' ? '/students' : '/staff';
      return api.get(url, { params: { search, limit: 8 } }).then(r => r.data.data);
    },
    enabled: search.length >= 2,
    staleTime: 15_000,
  });

  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data), staleTime: 300_000 });

  const mutation = useMutation({
    mutationFn: (body) => api.post('/events/certificates', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates-list'] });
      qc.invalidateQueries({ queryKey: ['events-dashboard'] });
      toast.success('Certificate issued');
      onClose(); reset(); setSelRec(null); setSearch('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const rName = (r) => {
    const p = r?.userId?.profile || r?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : r?.rollNumber || r?.employeeId || '—';
  };

  const onSubmit = (d) => {
    const details = {};
    tmpl.fields.forEach(f => { if (d[f]) details[f] = d[f]; });
    if (d.additionalNote) details.additionalNote = d.additionalNote;
    mutation.mutate({
      type:           certType,
      recipientId:    selRec?._id || d.recipientId,
      recipientModel,
      issuedDate:     d.issuedDate,
      purpose:        d.purpose,
      academicYearId: d.academicYearId || undefined,
      details,
      status:         'issued',
    });
  };

  const DYNAMIC_FIELDS = {
    purpose:        { label: 'Purpose', type: 'text', placeholder: 'e.g. Passport / Bank Account opening' },
    classSection:   { label: 'Class & Section', type: 'text', placeholder: 'e.g. 10-A' },
    academicYear:   { label: 'Academic Year', type: 'text', placeholder: 'e.g. 2024-25' },
    conductRemark:  { label: 'Conduct Remark', type: 'text', placeholder: 'e.g. good / excellent' },
    lastDate:       { label: 'Last Attendance Date', type: 'date', placeholder: '' },
    reason:         { label: 'Reason for Transfer', type: 'text', placeholder: '' },
    eventName:      { label: 'Event Name', type: 'text', placeholder: '' },
    eventDate:      { label: 'Event Date', type: 'date', placeholder: '' },
    role:           { label: 'Role / Category', type: 'text', placeholder: 'e.g. Participant / Winner' },
    achievement:    { label: 'Achievement', type: 'text', placeholder: 'e.g. First Prize in Science Quiz' },
    rank:           { label: 'Rank / Position', type: 'text', placeholder: '' },
    subject:        { label: 'Subject / Competition', type: 'text', placeholder: '' },
    designation:    { label: 'Designation', type: 'text', placeholder: '' },
    department:     { label: 'Department', type: 'text', placeholder: '' },
    fromDate:       { label: 'From Date', type: 'date', placeholder: '' },
    toDate:         { label: 'To Date', type: 'date', placeholder: '' },
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Issue Certificate</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            {/* Recipient */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {['Student','Staff'].map(m => (
                  <button key={m} type="button" onClick={() => { setRecipientModel(m); setSearch(''); setSelRec(null); setValue('recipientId',''); }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${recipientModel === m ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-500'}`}>
                    {m}
                  </button>
                ))}
              </div>
              {selRec
                ? (
                  <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                    <UserCheck size={13} className="text-primary-600"/>
                    <span className="flex-1 text-sm font-medium">{rName(selRec)}</span>
                    <button type="button" onClick={() => { setSelRec(null); setValue('recipientId',''); setSearch(''); }} className="btn-icon text-slate-400"><X size={12}/></button>
                  </div>
                )
                : (
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8 text-sm" placeholder={`Search ${recipientModel.toLowerCase()}…`}/>
                    {searchRes.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-44 overflow-y-auto divide-y divide-slate-100">
                        {searchRes.map(r => (
                          <button key={r._id} type="button" onClick={() => { setSelRec(r); setValue('recipientId', r._id); setSearch(''); }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left">
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">{rName(r)[0]?.toUpperCase()}</div>
                            <div><p className="text-sm font-medium">{rName(r)}</p><p className="text-xs text-slate-400">{r.rollNumber||r.employeeId}</p></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              <input type="hidden" {...register('recipientId',{required:true})}/>
              {errors.recipientId && <p className="form-error text-xs">Select a recipient</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Certificate Type</label>
                <select {...register('type')} className="form-select capitalize">
                  {CERT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input type="date" {...register('issuedDate')} className="form-input"/>
              </div>
            </div>

            {/* Dynamic fields per cert type */}
            <div className="grid grid-cols-2 gap-3">
              {tmpl.fields.map(f => {
                const fd = DYNAMIC_FIELDS[f];
                if (!fd) return null;
                return (
                  <div key={f} className={`form-group ${f === 'purpose' ? 'col-span-2' : ''}`}>
                    <label className="form-label">{fd.label}</label>
                    <input type={fd.type} {...register(f)} className="form-input text-sm" placeholder={fd.placeholder}/>
                  </div>
                );
              })}
            </div>

            <div className="form-group">
              <label className="form-label">Additional Note <span className="text-xs text-slate-400">(optional)</span></label>
              <input {...register('additionalNote')} className="form-input text-sm" placeholder="Any extra note to appear on the certificate"/>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                <Award size={14}/> {mutation.isPending ? 'Issuing…' : 'Issue Certificate'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function CertificatesPage() {
  const [open,       setOpen]       = useState(false);
  const [printCert,  setPrintCert]  = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [page,       setPage]       = useState(1);
  const qc = useQueryClient();

  const params = { page, limit: 30 };
  if (typeFilter) params.type = typeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['certificates-list', params],
    queryFn:  () => api.get('/events/certificates', { params }).then(r => r.data),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const certs = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/events/certificates/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates-list'] });
      qc.invalidateQueries({ queryKey: ['events-dashboard'] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const { data: settingsData } = useQuery({
    queryKey: ['school-settings'],
    queryFn:  () => api.get('/settings').then(r => r.data.data),
    staleTime: 600_000,
  });

  const fetchAndPrint = async (certId) => {
    try {
      const res = await api.get(`/events/certificates/${certId}`);
      setPrintCert(res.data.data);
    } catch (e) { toast.error('Failed to load certificate'); }
  };

  const rName = (r) => {
    const p = r?.userId?.profile || r?.profile;
    return p ? `${p.firstName??''} ${p.lastName??''}`.trim() : r?.rollNumber || r?.employeeId || '—';
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificates</h1>
          <p className="page-subtitle">{data?.total ?? 0} certificates issued</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-primary btn-md">
          <Plus size={15}/> Issue Certificate
        </button>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {[['','All Types'], ...CERT_TYPES.map(t => [t, t])].map(([v,l]) => (
          <button key={v} onClick={() => { setTypeFilter(v); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${typeFilter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
            {l || 'All Types'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-14 rounded-lg"/>)}</div>
          : certs.length === 0
            ? (
              <div className="card-body text-center py-14 text-slate-400">
                <Award size={32} className="mx-auto mb-2 text-slate-300"/>
                <p>No certificates issued yet.</p>
              </div>
            )
            : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Cert No.</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Recipient</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Issued Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Status</th>
                      <th className="px-4 py-3"/>
                    </tr>
                  </thead>
                  <tbody>
                    {certs.map(c => (
                      <tr key={c._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono text-slate-600">{c.certNumber}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">{rName(c.recipientId)}</p>
                          <span className={`text-xs badge ${c.recipientModel === 'Student' ? 'badge-primary' : 'badge-warning'}`}>{c.recipientModel}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs capitalize ${CERT_COLORS[c.type] ?? 'badge-default'}`}>{c.type}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{dayjs(c.issuedDate).format('DD MMM YYYY')}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {c.status === 'issued'
                            ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={11}/> Issued</span>
                            : <span className="text-xs text-slate-400">Draft</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => fetchAndPrint(c._id)} className="btn-icon text-slate-400 hover:text-primary-600" title="Preview & Print">
                              <Printer size={13}/>
                            </button>
                            <button onClick={() => { if (confirm('Delete this certificate?')) deleteMut.mutate(c._id); }}
                              className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn btn-ghost btn-xs">Previous</button>
                      <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="btn btn-ghost btn-xs">Next</button>
                    </div>
                  </div>
                )}
              </>
            )
        }
      </div>

      <IssueModal open={open} onClose={() => setOpen(false)}/>
      {printCert && (
        <PrintCertificate
          cert={printCert}
          schoolName={settingsData?.schoolName}
          onClose={() => setPrintCert(null)}
        />
      )}
    </div>
  );
}
