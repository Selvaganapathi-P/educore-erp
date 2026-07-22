import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit2, User, BookOpen, Heart, Bus, Home, Trophy } from 'lucide-react';
import dayjs from 'dayjs';
import * as Tabs from '@radix-ui/react-tabs';
import api from '../../lib/axios';
import { Avatar } from './StudentsPage';

const STATUS_BADGE = { active:'badge-success', transferred:'badge-info', left:'badge-slate', alumni:'badge-warning' };

export default function StudentDetailPage() {
  const { id } = useParams();
  const nav    = useNavigate();

  const { data: p, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn:  () => api.get(`/students/${id}`).then(r => r.data.data),
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
    { id: 'personal',  label: 'Personal',   icon: User    },
    { id: 'academic',  label: 'Academic',   icon: BookOpen },
    { id: 'medical',   label: 'Medical',    icon: Heart   },
    { id: 'transport', label: 'Transport',  icon: Bus     },
    { id: 'hostel',    label: 'Hostel',     icon: Home    },
    { id: 'achieve',   label: 'Achievements', icon: Trophy },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="card card-body flex flex-col sm:flex-row gap-5 items-start">
        <Avatar name={fullName} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <button onClick={() => nav(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-1">
                <ArrowLeft size={14}/> Students
              </button>
              <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
              <p className="text-slate-500 text-sm">{u.email}</p>
            </div>
            <Link to={`/students/${id}/edit`} className="btn btn-outline btn-sm">
              <Edit2 size={14}/> Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Chip label="Roll No" value={p.rollNumber} />
            <Chip label="Class" value={`${p.class} – ${p.section}`} />
            <Chip label="Year" value={p.academicYear} />
            <span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-slate'} capitalize self-center`}>{p.status}</span>
          </div>
        </div>
      </div>

      <Tabs.Root defaultValue="personal">
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

        <Tabs.Content value="personal" className="mt-4">
          <div className="card card-body grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Row label="Date of Birth"  value={u.profile?.dateOfBirth ? dayjs(u.profile.dateOfBirth).format('DD MMMM YYYY') : '—'} />
            <Row label="Gender"         value={u.profile?.gender}    cls="capitalize" />
            <Row label="Blood Group"    value={u.profile?.bloodGroup ?? '—'} />
            <Row label="Phone"          value={u.profile?.phone      ?? '—'} />
            <Row label="Category"       value={p.feeCategory?.replace(/_/g,' ')} cls="capitalize" />
            <Row label="House"          value={p.house ?? '—'} />
            <Row label="Admission No"   value={p.admissionNo ?? '—'} />
            <Row label="Joined"         value={dayjs(p.createdAt).format('DD MMM YYYY')} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="academic" className="mt-4">
          <div className="card card-body space-y-4 text-sm">
            <Row label="Class" value={`${p.class} – Section ${p.section}`} />
            <Row label="Academic Year" value={p.academicYear} />
            <Row label="Extracurricular Sports" value={p.extracurricular?.sports?.join(', ') || '—'} />
            <Row label="Clubs" value={p.extracurricular?.clubs?.join(', ') || '—'} />
            {p.previousResults?.length > 0 && (
              <div>
                <p className="font-medium text-slate-700 mb-2">Previous Results</p>
                <div className="table-container">
                  <table className="table text-sm">
                    <thead><tr><th>Year</th><th>Class</th><th>%</th><th>Grade</th><th>Result</th></tr></thead>
                    <tbody>
                      {p.previousResults.map((r, i) => (
                        <tr key={i}>
                          <td>{r.academicYear}</td><td>{r.class}</td>
                          <td>{r.percentage ?? '—'}</td><td>{r.grade ?? '—'}</td>
                          <td className="capitalize">{r.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="medical" className="mt-4">
          <div className="card card-body grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Row label="Doctor Name"  value={p.medical?.doctorName  ?? '—'} />
            <Row label="Doctor Phone" value={p.medical?.doctorPhone ?? '—'} />
            <Row label="Insurance No" value={p.medical?.insuranceNo ?? '—'} />
            <Row label="Height (cm)"  value={p.medical?.height      ?? '—'} />
            <Row label="Weight (kg)"  value={p.medical?.weight      ?? '—'} />
            <Row label="Last Checkup" value={p.medical?.lastCheckup ? dayjs(p.medical.lastCheckup).format('DD MMM YYYY') : '—'} />
            {p.medical?.allergies?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-slate-500 mb-1">Allergies</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.medical.allergies.map(a => <span key={a} className="badge badge-danger">{a}</span>)}
                </div>
              </div>
            )}
            {p.medical?.conditions?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-slate-500 mb-1">Medical Conditions</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.medical.conditions.map(c => <span key={c} className="badge badge-warning">{c}</span>)}
                </div>
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="transport" className="mt-4">
          <div className="card card-body text-sm">
            {p.transport?.enrolled
              ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Row label="Route No"     value={p.transport.routeNo     ?? '—'} />
                  <Row label="Vehicle No"   value={p.transport.vehicleNo   ?? '—'} />
                  <Row label="Pickup Point" value={p.transport.pickupPoint ?? '—'} />
                  <Row label="Bus Pass No"  value={p.transport.busPassNo   ?? '—'} />
                  <Row label="Pickup Time"  value={p.transport.pickupTime  ?? '—'} />
                  <Row label="Drop Time"    value={p.transport.dropTime    ?? '—'} />
                </div>
              : <p className="text-slate-500">Not enrolled in school transport.</p>
            }
          </div>
        </Tabs.Content>

        <Tabs.Content value="hostel" className="mt-4">
          <div className="card card-body text-sm">
            {p.hostel?.enrolled
              ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Row label="Hostel Name" value={p.hostel.hostelName ?? '—'} />
                  <Row label="Room No"     value={p.hostel.roomNo     ?? '—'} />
                  <Row label="Bed No"      value={p.hostel.bedNo      ?? '—'} />
                  <Row label="Warden"      value={p.hostel.warden     ?? '—'} />
                </div>
              : <p className="text-slate-500">Not enrolled in hostel.</p>
            }
          </div>
        </Tabs.Content>

        <Tabs.Content value="achieve" className="mt-4">
          <div className="card card-body">
            {p.achievements?.length > 0
              ? <ol className="space-y-3">
                  {p.achievements.map((a, i) => (
                    <li key={i} className="flex gap-3">
                      <Trophy size={16} className="text-yellow-500 shrink-0 mt-0.5"/>
                      <div>
                        <p className="font-medium text-slate-800">{a.title}</p>
                        {a.description && <p className="text-sm text-slate-500">{a.description}</p>}
                        <p className="text-xs text-slate-400 capitalize">{a.level} · {a.date ? dayjs(a.date).format('MMM YYYY') : ''}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              : <p className="text-slate-500 text-sm">No achievements recorded yet.</p>
            }
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
