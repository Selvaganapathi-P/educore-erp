import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Save, ChevronDown, ChevronUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../lib/axios';
import { EmptyState } from '../../components/ui/EmptyState';

const ROLE_META = {
  super_admin:       { color: 'bg-red-100 text-red-700',     label: 'Super Admin'      },
  school_admin:      { color: 'bg-purple-100 text-purple-700',label: 'School Admin'     },
  principal:         { color: 'bg-blue-100 text-blue-700',   label: 'Principal'         },
  vice_principal:    { color: 'bg-blue-100 text-blue-700',   label: 'Vice Principal'    },
  teacher:           { color: 'bg-green-100 text-green-700', label: 'Teacher'           },
  student:           { color: 'bg-teal-100 text-teal-700',   label: 'Student'           },
  parent:            { color: 'bg-cyan-100 text-cyan-700',   label: 'Parent'            },
  hr:                { color: 'bg-orange-100 text-orange-700',label: 'HR Manager'       },
  receptionist:      { color: 'bg-yellow-100 text-yellow-700',label: 'Receptionist'    },
  accountant:        { color: 'bg-amber-100 text-amber-700', label: 'Accountant'        },
  librarian:         { color: 'bg-lime-100 text-lime-700',   label: 'Librarian'         },
  transport_manager: { color: 'bg-sky-100 text-sky-700',     label: 'Transport Mgr'    },
  hostel_warden:     { color: 'bg-indigo-100 text-indigo-700',label: 'Hostel Warden'   },
  store_manager:     { color: 'bg-violet-100 text-violet-700',label: 'Store Manager'   },
  nurse:             { color: 'bg-pink-100 text-pink-700',   label: 'Nurse'             },
  counselor:         { color: 'bg-rose-100 text-rose-700',   label: 'Counselor'         },
  security_guard:    { color: 'bg-slate-100 text-slate-700', label: 'Security Guard'    },
  it_administrator:  { color: 'bg-gray-100 text-gray-700',   label: 'IT Administrator' },
};

export default function RolesPage() {
  const [selected, setSelected] = useState(null);

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn:  () => api.get('/roles').then(r => r.data.data),
  });

  const { data: stats = [] } = useQuery({
    queryKey: ['role-stats'],
    queryFn:  () => api.get('/roles/stats').then(r => r.data.data),
  });

  const statsMap = Object.fromEntries(stats.map(s => [s.role, s.count]));
  const selectedRole = roles.find(r => r.name === selected);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">View and customize permissions for each role</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role list */}
        <div className="space-y-2">
          {rolesLoading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)
            : roles.map(r => {
                const meta = ROLE_META[r.name] ?? { color: 'bg-slate-100 text-slate-700', label: r.displayName };
                const count = statsMap[r.name] ?? 0;
                return (
                  <button
                    key={r.name}
                    onClick={() => setSelected(r.name === selected ? null : r.name)}
                    className={clsx(
                      'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                      selected === r.name
                        ? 'border-primary-300 bg-primary-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                    )}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${meta.color}`}>
                      {meta.label[0]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{meta.label}</p>
                      <p className="text-xs text-slate-400">{count} {count === 1 ? 'user' : 'users'}</p>
                    </div>
                    {selected === r.name ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                  </button>
                );
              })
          }
        </div>

        {/* Permission matrix */}
        <div className="lg:col-span-2">
          {selectedRole
            ? <PermissionMatrix role={selectedRole} />
            : <div className="card h-full flex items-center justify-center">
                <EmptyState icon={Shield} title="Select a role" description="Click a role on the left to view and edit its permissions." />
              </div>
          }
        </div>
      </div>
    </div>
  );
}

function PermissionMatrix({ role }) {
  const qc = useQueryClient();

  const { data: catalogue = {} } = useQuery({
    queryKey: ['permissions-catalogue'],
    queryFn:  () => api.get('/roles/permissions/catalogue').then(r => r.data.data),
  });

  const [selected, setSelected] = useState(() => new Set(role.permissions ?? []));

  const mut = useMutation({
    mutationFn: () => api.put(`/roles/${role.name}/permissions`, { permissions: [...selected] }),
    onSuccess: () => { toast.success('Permissions saved'); qc.invalidateQueries(['roles']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Save failed'),
  });

  const isWildcard = role.permissions?.includes('*');

  function togglePerm(perm) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(perm) ? next.delete(perm) : next.add(perm);
      return next;
    });
  }

  function toggleModule(perms) {
    setSelected(prev => {
      const next  = new Set(prev);
      const allOn = perms.every(p => next.has(p));
      perms.forEach(p => allOn ? next.delete(p) : next.add(p));
      return next;
    });
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">{ROLE_META[role.name]?.label ?? role.displayName}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isWildcard ? 'Wildcard — full access to everything' : `${selected.size} permissions selected`}
          </p>
        </div>
        {!isWildcard && (
          <button onClick={() => mut.mutate()} disabled={mut.isPending} className="btn btn-primary btn-sm">
            {mut.isPending
              ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={13} />
            }
            Save
          </button>
        )}
      </div>

      {isWildcard
        ? (
          <div className="card-body">
            <div className="alert alert-info">
              This role has wildcard (<code>*</code>) access — it can perform any action across all modules.
              Super Admin permissions cannot be modified through this interface.
            </div>
          </div>
        )
        : (
          <div className="card-body space-y-4 max-h-[520px] overflow-y-auto">
            {Object.entries(catalogue).map(([module, perms]) => {
              const allOn = perms.every(p => selected.has(p));
              const someOn = perms.some(p => selected.has(p));
              return (
                <div key={module} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleModule(perms)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <input
                      type="checkbox"
                      checked={allOn}
                      ref={el => el && (el.indeterminate = !allOn && someOn)}
                      onChange={() => toggleModule(perms)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 rounded text-primary-600"
                    />
                    <span className="font-medium text-slate-700 capitalize">{module.replace(/_/g,' ')}</span>
                    <span className="ml-auto text-xs text-slate-400">{perms.filter(p => selected.has(p)).length}/{perms.length}</span>
                  </button>
                  <div className="px-4 py-2 flex flex-wrap gap-2">
                    {perms.map(perm => {
                      const action = perm.split('.')[1];
                      const on = selected.has(perm);
                      return (
                        <label key={perm} className={clsx(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer border transition-all',
                          on ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300',
                        )}>
                          <input type="checkbox" checked={on} onChange={() => togglePerm(perm)} className="sr-only" />
                          <span className={clsx('w-1.5 h-1.5 rounded-full', on ? 'bg-primary-500' : 'bg-slate-300')} />
                          {action}
                        </label>
                      );
                    })}
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
