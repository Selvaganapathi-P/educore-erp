import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Briefcase, GraduationCap, Phone, Calendar, Award } from 'lucide-react';
import dayjs from 'dayjs';
import * as Tabs from '@radix-ui/react-tabs';
import api from '../../lib/axios';
import { Avatar } from '../students/StudentsPage';

const STATUS_BADGE  = { active:'badge-success', on_leave:'badge-warning', suspended:'badge-danger', relieved:'badge-slate', retired:'badge-info' };
const EMP_BADGE     = { permanent:'badge-success', contractual:'badge-warning', part_time:'badge-info', visiting:'badge-slate', probation:'badge-primary' };

export default function StaffDetailPage() {
  const { id } = useParams();
  const nav    = useNavigate();

  const { data: p, isLoading } = useQuery({
    queryKey: ['staff-member', id],
    queryFn:  () => api.get(`/staff/${id}`).then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {Array.from({length:3}).map((_,i)=><div key={i} className="card card-body"><div className="skeleton h-24 rounded"/></div>)}
    </div>
  );
  if (!p) return null;

  const u        = p.userId ?? {};
  const fullName = `${u.profile?.firstName ?? ''} ${u.profile?.lastName ?? ''}`.trim();

  const TABS_DEF = [
    { id: 'employment',     label: 'Employment',    icon: Briefcase   },
    { id: 'qualifications', label: 'Qualifications',icon: GraduationCap },
    { id: 'experience',     label: 'Experience',    icon: Award       },
    { id: 'emergency',      label: 'Emergency',     icon: Phone       },
    { id: 'leaves',         label: 'Leave Balance', icon: Calendar    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card card-body flex flex-col sm:flex-row gap-5 items-start">
        <Avatar name={fullName} size="lg"/>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-1">
                <ArrowLeft size={14}/> Staff
              </button>
              <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
              <p className="text-slate-500 text-sm">{u.email}</p>
            </div>
            <Link to={`/staff/${id}/edit`} className="btn btn-outline btn-sm">
              <Edit2 size={14}/> Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Chip label="Employee ID"   value={p.employeeId} />
            <Chip label="Department"    value={p.department} />
            <Chip label="Designation"   value={p.designation} />
            <span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-slate'} capitalize self-center`}>{p.status?.replace(/_/g,' ')}</span>
            <span className={`badge ${EMP_BADGE[p.employmentType] ?? 'badge-slate'} capitalize self-center`}>{p.employmentType?.replace(/_/g,' ')}</span>
          </div>
        </div>
      </div>

      <Tabs.Root defaultValue="employment">
        <Tabs.List className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-wrap">
          {TABS_DEF.map(({ id: tid, label, icon: Icon }) => (
            <Tabs.Trigger key={tid} value={tid}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all
                data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-700
                text-slate-500 hover:text-slate-700">
              <Icon size={13}/>{label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="employment" className="mt-4">
          <div className="card card-body grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Row label="Joining Date"     value={dayjs(p.joiningDate).format('DD MMMM YYYY')} />
            <Row label="Confirmation"     value={p.confirmationDate ? dayjs(p.confirmationDate).format('DD MMMM YYYY') : '—'} />
            <Row label="Employment Type"  value={p.employmentType?.replace(/_/g,' ')} cls="capitalize" />
            <Row label="Reporting To"     value={p.reportingTo ? `${p.reportingTo.profile?.firstName ?? ''} ${p.reportingTo.profile?.lastName ?? ''}`.trim() : '—'} />
            <Row label="Salary Grade"     value={p.salary?.grade ?? '—'} />
            <Row label="Biometric ID"     value={p.biometricId ?? '—'} />
            {p.subjects?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-slate-500 mb-1">Subjects Taught</p>
                <div className="flex flex-wrap gap-1.5">{p.subjects.map(s=><span key={s} className="badge badge-primary">{s}</span>)}</div>
              </div>
            )}
            {p.classes?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-slate-500 mb-1">Classes Assigned</p>
                <div className="flex flex-wrap gap-1.5">{p.classes.map(c=><span key={c} className="badge badge-info">{c}</span>)}</div>
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="qualifications" className="mt-4">
          <div className="card card-body">
            {p.qualifications?.length > 0
              ? <div className="table-container">
                  <table className="table text-sm">
                    <thead><tr><th>Degree</th><th>Subject</th><th>Institution</th><th>Year</th><th>%</th></tr></thead>
                    <tbody>
                      {p.qualifications.map((q, i) => (
                        <tr key={i}>
                          <td className="font-medium">{q.degree}</td>
                          <td>{q.subject ?? '—'}</td>
                          <td>{q.institution ?? '—'}</td>
                          <td>{q.year ?? '—'}</td>
                          <td>{q.percentage ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              : <p className="text-slate-500 text-sm">No qualifications recorded.</p>
            }
          </div>
        </Tabs.Content>

        <Tabs.Content value="experience" className="mt-4">
          <div className="card card-body space-y-4">
            {p.experience?.length > 0
              ? p.experience.map((e, i) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary-400 mt-2 shrink-0"/>
                    <div>
                      <p className="font-semibold text-slate-800">{e.title}</p>
                      <p className="text-sm text-slate-600">{e.organization}</p>
                      <p className="text-xs text-slate-400">
                        {dayjs(e.from).format('MMM YYYY')} – {e.isCurrent ? 'Present' : (e.to ? dayjs(e.to).format('MMM YYYY') : '—')}
                      </p>
                      {e.description && <p className="text-sm text-slate-500 mt-1">{e.description}</p>}
                    </div>
                  </div>
                ))
              : <p className="text-slate-500 text-sm">No experience recorded.</p>
            }
          </div>
        </Tabs.Content>

        <Tabs.Content value="emergency" className="mt-4">
          <div className="card card-body grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Row label="Contact Name"     value={p.emergencyContact?.name         ?? '—'} />
            <Row label="Relationship"     value={p.emergencyContact?.relationship ?? '—'} />
            <Row label="Phone"            value={p.emergencyContact?.phone        ?? '—'} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="leaves" className="mt-4">
          <div className="card card-body">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Casual Leave',   val: p.leaveBalance?.casual   ?? 0 },
                { label: 'Sick Leave',     val: p.leaveBalance?.sick     ?? 0 },
                { label: 'Earned Leave',   val: p.leaveBalance?.earned   ?? 0 },
                { label: 'LOP Taken',      val: p.leaveBalance?.lop      ?? 0 },
              ].map(({ label, val }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800 tabular-nums">{val}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <div className="bg-slate-100 rounded-lg px-3 py-1.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function Row({ label, value, cls = '' }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500 shrink-0">{label}</dt>
      <dd className={`font-medium text-slate-800 text-right ${cls}`}>{value ?? '—'}</dd>
    </div>
  );
}
