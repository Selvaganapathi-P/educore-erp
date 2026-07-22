import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Search, BookOpen, Pencil, Trash2, X, MapPin, Copy } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

function BookFormModal({ open, onClose, existing }) {
  const qc     = useQueryClient();
  const isEdit = !!existing;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: existing ?? {
      title: '', author: '', isbn: '', category: '', publisher: '',
      edition: '', language: 'English', location: '', totalCopies: 1, description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (body) => isEdit
      ? api.put(`/library/books/${existing._id}`, body).then(r => r.data)
      : api.post('/library/books', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-books'] });
      toast.success(isEdit ? 'Book updated' : 'Book added');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => mutation.mutate({ ...data, totalCopies: Number(data.totalCopies) });

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-2xl">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{isEdit ? 'Edit Book' : 'Add Book'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="form-label">Title *</label>
                <input {...register('title', { required: true })} className="form-input" placeholder="Book title"/>
                {errors.title && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Author *</label>
                <input {...register('author', { required: true })} className="form-input" placeholder="Author name"/>
                {errors.author && <p className="form-error">Required</p>}
              </div>
              <div className="form-group">
                <label className="form-label">ISBN</label>
                <input {...register('isbn')} className="form-input" placeholder="978-…"/>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input {...register('category')} className="form-input" placeholder="e.g. Science, Fiction"/>
              </div>
              <div className="form-group">
                <label className="form-label">Publisher</label>
                <input {...register('publisher')} className="form-input"/>
              </div>
              <div className="form-group">
                <label className="form-label">Edition</label>
                <input {...register('edition')} className="form-input" placeholder="e.g. 3rd"/>
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <input {...register('language')} className="form-input" placeholder="English"/>
              </div>
              <div className="form-group">
                <label className="form-label">Location / Shelf</label>
                <input {...register('location')} className="form-input" placeholder="e.g. Shelf B-2"/>
              </div>
              <div className="form-group">
                <label className="form-label">Total Copies *</label>
                <input type="number" min="1" {...register('totalCopies', { required: true, min: 1 })} className="form-input"/>
                {errors.totalCopies && <p className="form-error">Min 1</p>}
              </div>
              <div className="form-group sm:col-span-2">
                <label className="form-label">Description</label>
                <textarea {...register('description')} className="form-textarea" rows={2}/>
              </div>
            </div>
            <div className="dialog-footer mt-4">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Add Book'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function BooksPage() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState('');
  const [modal,    setModal]    = useState(null);

  const params = { limit: 30 };
  if (search)    params.search    = search;
  if (category)  params.category  = category;
  if (available) params.available = 'true';

  const { data, isLoading } = useQuery({
    queryKey: ['library-books', params],
    queryFn:  () => api.get('/library/books', { params }).then(r => r.data),
    staleTime: 30_000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['library-categories'],
    queryFn:  () => api.get('/library/categories').then(r => r.data.data),
    staleTime: 300_000,
  });

  const books = data?.data ?? [];

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/library/books/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['library-books'] }); toast.success('Deleted'); },
    onError:   (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Catalog</h1>
          <p className="page-subtitle">{data?.total ?? 0} titles in library</p>
        </div>
        <button onClick={() => setModal('new')} className="btn btn-primary btn-md">
          <Plus size={15}/> Add Book
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="form-input pl-9" placeholder="Search title, author, ISBN…"/>
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="form-select w-40">
          <option value="">All Categories</option>
          {categories.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={!!available} onChange={e => setAvailable(e.target.checked ? 'true' : '')} className="form-checkbox"/>
          Available only
        </label>
      </div>

      {/* Grid */}
      {isLoading
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-36 rounded-xl"/>)}</div>
        : books.length === 0
          ? (
            <div className="card card-body text-center py-16 text-slate-400">
              <BookOpen size={36} className="mx-auto mb-3 text-slate-300"/>
              <p className="font-medium">No books found</p>
              <p className="text-sm mt-1">Add your first book to the catalog.</p>
            </div>
          )
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map(book => (
                <div key={book._id} className="card card-body flex gap-4 hover:shadow-md transition-shadow">
                  {/* Cover placeholder */}
                  <div className="w-14 h-20 rounded-md bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {book.coverImage
                      ? <img src={book.coverImage} alt="" className="w-full h-full object-cover"/>
                      : <BookOpen size={20} className="text-primary-400"/>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">{book.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
                    {book.category && (
                      <span className="badge badge-primary text-xs mt-1 inline-block">{book.category}</span>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Copy size={11}/>
                          <span className={book.availableCopies > 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                            {book.availableCopies}
                          </span>
                          <span className="text-slate-400">/ {book.totalCopies}</span>
                        </span>
                        {book.location && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={10}/>{book.location}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setModal(book)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={13}/></button>
                        <button onClick={() => deleteMut.mutate(book._id)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <BookFormModal
        open={!!modal}
        onClose={() => setModal(null)}
        existing={modal && modal !== 'new' ? modal : null}
      />
    </div>
  );
}
