import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X, TrendingDown, TrendingUp, RotateCcw, RefreshCw, SlidersHorizontal, Search } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const TYPE_CFG = {
  purchase:       { label: 'Purchase',     color: 'badge-success', iconColor: 'text-emerald-600 bg-emerald-50', Icon: TrendingUp,      sign: '+', textColor: 'text-emerald-600' },
  issue:          { label: 'Issue',        color: 'badge-error',   iconColor: 'text-red-600    bg-red-50',      Icon: TrendingDown,    sign: '-', textColor: 'text-red-600'     },
  return:         { label: 'Return',       color: 'badge-info',    iconColor: 'text-blue-600   bg-blue-50',     Icon: RotateCcw,       sign: '+', textColor: 'text-blue-600'    },
  adjustment_in:  { label: 'Adj. In',      color: 'badge-primary', iconColor: 'text-teal-600   bg-teal-50',     Icon: RefreshCw,       sign: '+', textColor: 'text-teal-600'    },
  adjustment_out: { label: 'Adj. Out',     color: 'badge-warning', iconColor: 'text-orange-600 bg-orange-50',   Icon: SlidersHorizontal, sign: '-', textColor: 'text-orange-600' },
};

function MovementModal({ open, onClose }) {
  const qc = useQueryClient();
  const [itemSearch, setItemSearch]   = useState('');
  const [selItem,    setSelItem]      = useState(null);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { itemId:'', type:'purchase', quantity:1, reference:'', notes:'', movedAt: dayjs().format('YYYY-MM-DD'), issuedToModel:'Student', issuedToId:'' },
  });

  const movType = watch('type');
  const isIssue = movType === 'issue';

  const { data: itemResults = [] } = useQuery({
    queryKey: ['item-search', itemSearch],
    queryFn:  () => itemSearch.length >= 2 ? api.get('/inventory/items', { params: { search: itemSearch, limit: 8 } }).then(r => r.data.data) : [],
    enabled:  itemSearch.length >= 2, staleTime: 10_000,
  });

  const issuedToModel = watch('issuedToModel');
  const { data: issuedToOptions = [] } = useQuery({
    queryKey: ['issued-to', issuedToModel],
    queryFn:  () => {
      if (!isIssue) return [];
      const url = issuedToModel === 'Student' ? '/students' : '/staff';
      return api.get(url, { params: { limit: 50 } }).then(r => r.data.data);
    },
    enabled: isIssue,
    staleTime: 120_000,
  });

  const mutation = useMutation({
    mutationFn: (body) => api.post('/inventory/movements', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-movements'] });
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      qc.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      toast.success('Movement recorded');
      onClose(); reset(); setSelItem(null); setItemSearch('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (d) => mutation.mutate({
    ...d,
    quantity:  Number(d.quantity),
    issuedToId:    isIssue && d.issuedToId    ? d.issuedToId    : undefined,
    issuedToModel: isIssue && d.issuedToModel ? d.issuedToModel : undefined,
  });

  const personName = (p) => {
    if (!p) return '';
    if (p.profile) return `${p.profile?.firstName??''} ${p.profile?.lastName??''}`.trim();
    const u = p.userId;
    if (u?.profile) return `${u.profile?.firstName??''} ${u.profile?.lastName??''}`.trim();
    return p.rollNumber || p.employeeId || '';
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Record Stock Movement</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            {/* Item */}
            <div className="form-group">
              <label className="form-label">Item *</label>
              {selItem
                ? (
                  <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                    <span className="flex-1 text-sm font-medium">{selItem.name}</span>
                    <span className="text-xs text-slate-400">{selItem.currentStock} {selItem.unit} in stock</span>
                    <button type="button" onClick={() => { setSelItem(null); setValue('itemId',''); }} className="btn-icon text-slate-400"><X size={12}/></button>
                  </div>
                )
                : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={itemSearch} onChange={e => setItemSearch(e.target.value)} className="form-input pl-8" placeholder="Search item by name or code…"/>
                    {itemResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-44 overflow-y-auto divide-y divide-slate-100">
                        {itemResults.map(it => (
                          <button key={it._id} type="button" onClick={() => { setSelItem(it); setValue('itemId',it._id); setItemSearch(''); }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left">
                            <div><p className="text-sm font-medium">{it.name}</p><p className="text-xs text-slate-400 capitalize">{it.category} · {it.currentStock} {it.unit}</p></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              <input type="hidden" {...register('itemId',{required:true})}/>
              {errors.itemId && <p className="form-error">Select an item</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Movement Type *</label>
                <select {...register('type')} className="form-select">
                  {Object.entries(TYPE_CFG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input type="number" min="1" {...register('quantity',{required:true,min:1})} className="form-input"/>
                {errors.quantity && <p className="form-error">Min 1</p>}
              </div>
            </div>

            {isIssue && (
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Issue To</label>
                  <select {...register('issuedToModel')} className="form-select">
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Person</label>
                  <select {...register('issuedToId')} className="form-select">
                    <option value="">— optional —</option>
                    {issuedToOptions.map(p => <option key={p._id} value={p._id}>{personName(p)}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" {...register('movedAt')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Reference / PO No.</label>
                <input {...register('reference')} className="form-input" placeholder="PO-2025-001"/>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Notes</label>
                <input {...register('notes')} className="form-input" placeholder="Additional details…"/>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Recording…' : 'Record Movement'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function StockMovementsPage() {
  const [open,       setOpen]       = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [page,       setPage]       = useState(1);

  const params = { page, limit: 30 };
  if (typeFilter) params.type = typeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-movements', params],
    queryFn:  () => api.get('/inventory/movements', { params }).then(r => r.data),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const movements  = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Movements</h1>
          <p className="page-subtitle">All inventory transactions — purchases, issues, returns, adjustments</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-primary btn-md">
          <Plus size={15}/> Record Movement
        </button>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {[['','All Types'], ...Object.entries(TYPE_CFG).map(([v,c]) => [v, c.label])].map(([v,l]) => (
          <button key={v} onClick={() => { setTypeFilter(v); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${typeFilter === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-16 rounded-lg"/>)}</div>
          : movements.length === 0
            ? (
              <div className="card-body text-center py-14 text-slate-400">
                <RefreshCw size={32} className="mx-auto mb-2 text-slate-300"/>
                <p>No movements recorded yet.</p>
              </div>
            )
            : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Item</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Type</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Stock After</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Issued To</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Reference</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map(m => {
                      const cfg   = TYPE_CFG[m.type] ?? TYPE_CFG.purchase;
                      const isOut = ['issue','adjustment_out'].includes(m.type);
                      const issuedName = (() => {
                        const p = m.issuedToId;
                        if (!p) return null;
                        const u = p.userId;
                        const pr = u?.profile || p.profile;
                        if (pr) return `${pr.firstName??''} ${pr.lastName??''}`.trim();
                        return p.rollNumber || p.employeeId || null;
                      })();
                      return (
                        <tr key={m._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-700">{m.itemId?.name}</p>
                            {m.itemId?.code && <p className="text-xs text-slate-400">{m.itemId.code}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${cfg.iconColor}`}>
                                <cfg.Icon size={11}/>
                              </div>
                              <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-right text-sm font-bold ${cfg.textColor}`}>
                            {cfg.sign}{m.quantity} <span className="text-xs font-normal text-slate-400">{m.itemId?.unit}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-slate-600 hidden sm:table-cell">
                            {m.stockAfter ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{issuedName ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{m.reference || '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{dayjs(m.movedAt).format('DD MMM YY')}</td>
                        </tr>
                      );
                    })}
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

      <MovementModal open={open} onClose={() => setOpen(false)}/>
    </div>
  );
}
