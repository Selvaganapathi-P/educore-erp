import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Package, Pencil, Trash2, X, AlertTriangle, Search } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['stationery','furniture','electronics','lab','sports','cleaning','medical','uniform','other'];
const CAT_COLOR  = { stationery:'badge-primary', furniture:'badge-warning', electronics:'badge-info', lab:'badge-success', sports:'badge-error', cleaning:'badge-primary', medical:'badge-info', uniform:'badge-warning', other:'badge-default' };

function ItemModal({ open, onClose, existing }) {
  const qc     = useQueryClient();
  const isEdit = !!existing;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: existing ? {
      name: existing.name, code: existing.code || '', category: existing.category || 'other',
      unit: existing.unit || 'pcs', minStock: existing.minStock ?? 0,
      unitPrice: existing.unitPrice ?? 0, location: existing.location || '', description: existing.description || '',
    } : { name:'', code:'', category:'other', unit:'pcs', minStock:0, unitPrice:0, location:'', description:'' },
  });

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/inventory/items/${existing._id}`, body).then(r => r.data)
      : api.post('/inventory/items', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      qc.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      toast.success(isEdit ? 'Item updated' : 'Item created');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (d) => mutation.mutate({
    ...d, minStock: Number(d.minStock) || 0, unitPrice: Number(d.unitPrice) || 0,
  });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit Item' : 'New Item'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group col-span-2">
                <label className="form-label">Item Name *</label>
                <input {...register('name',{required:true})} className="form-input" placeholder="e.g. A4 Paper Ream"/>
                {errors.name && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Item Code</label>
                <input {...register('code')} className="form-input" placeholder="INV-001"/>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select {...register('category')} className="form-select">
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input {...register('unit')} className="form-input" placeholder="pcs / kg / litre"/>
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price (₹)</label>
                <input type="number" min="0" step="0.01" {...register('unitPrice')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Min Stock (alert threshold)</label>
                <input type="number" min="0" {...register('minStock')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Storage Location</label>
                <input {...register('location')} className="form-input" placeholder="Store Room A / Shelf 3"/>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Description</label>
                <textarea {...register('description')} className="form-textarea" rows={2}/>
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Create Item'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function ItemsPage() {
  const qc = useQueryClient();
  const [modal,    setModal]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page,     setPage]     = useState(1);

  const params = { page, limit: 20 };
  if (search)   params.search   = search;
  if (category) params.category = category;
  if (lowStock) params.lowStock = true;

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-items', params],
    queryFn:  () => api.get('/inventory/items', { params }).then(r => r.data),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const items = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/inventory/items/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      qc.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Item Catalog</h1>
          <p className="page-subtitle">{data?.total ?? 0} items in inventory</p>
        </div>
        <button onClick={() => setModal('new')} className="btn btn-primary btn-md">
          <Plus size={15}/> New Item
        </button>
      </div>

      {/* Search & filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-8" placeholder="Search items…"/>
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="form-select w-36">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <button onClick={() => { setLowStock(p => !p); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors ${lowStock ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-400'}`}>
          <AlertTriangle size={11}/> Low Stock Only
        </button>
      </div>

      {isLoading
        ? <div className="space-y-2">{Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-16 rounded-lg"/>)}</div>
        : items.length === 0
          ? (
            <div className="card card-body text-center py-14 text-slate-400">
              <Package size={36} className="mx-auto mb-3 text-slate-300"/>
              <p>No items found.</p>
            </div>
          )
          : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Location</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Value</th>
                    <th className="px-4 py-3"/>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const isLow = item.currentStock <= item.minStock;
                    return (
                      <tr key={item._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isLow && <AlertTriangle size={13} className="text-amber-500 shrink-0"/>}
                            <div>
                              <p className="text-sm font-medium text-slate-700">{item.name}</p>
                              {item.code && <p className="text-xs text-slate-400">{item.code}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`badge text-xs capitalize ${CAT_COLOR[item.category] ?? 'badge-default'}`}>{item.category}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">{item.location || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <p className={`text-sm font-bold ${item.currentStock === 0 ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-700'}`}>
                            {item.currentStock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                          </p>
                          {item.minStock > 0 && <p className="text-xs text-slate-400">min: {item.minStock}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right hidden md:table-cell">
                          {item.unitPrice > 0 ? `₹${(item.currentStock * item.unitPrice).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setModal(item)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={13}/></button>
                            <button onClick={() => { if (confirm('Delete this item?')) deleteMut.mutate(item._id); }}
                              className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
                          </div>
                        </td>
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
            </div>
          )
      }

      <ItemModal
        open={!!modal}
        onClose={() => setModal(null)}
        existing={modal && modal !== 'new' ? modal : null}
      />
    </div>
  );
}
