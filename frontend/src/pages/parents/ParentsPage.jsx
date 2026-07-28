import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Home, Mail, Phone } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import api from '../../lib/axios';

export default function ParentsPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['parents', page, dSearch],
    queryFn: () =>
      api.get('/users', {
        params: { page, limit: 20, role: 'parent', search: dSearch || undefined },
      }).then(r => r.data),
  });

  const parents = data?.data ?? [];
  const meta    = data?.meta ?? null;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parents</h1>
          <p className="page-subtitle">{meta?.total ?? '—'} parents registered</p>
        </div>
      </div>

      <div className="card card-body flex gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9 w-full"
            placeholder="Search name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Parent</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 rounded w-24" /></td>
                      ))}
                    </tr>
                  ))
                : parents.length === 0
                  ? <tr><td colSpan={4}><EmptyState icon={Home} title="No parents found" /></td></tr>
                  : parents.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center shrink-0">
                              {(p.profile?.firstName?.[0] || '?').toUpperCase()}{(p.profile?.lastName?.[0] || '').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">
                                {p.profile?.firstName} {p.profile?.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="flex items-center gap-1 text-slate-600 text-sm">
                            <Mail size={12} className="text-slate-400" />{p.email}
                          </span>
                        </td>
                        <td>
                          <span className="flex items-center gap-1 text-slate-600 text-sm">
                            <Phone size={12} className="text-slate-400" />{p.profile?.phone || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-slate'} capitalize`}>
                            {p.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
        <div className="px-4 border-t border-slate-100">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
