import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = meta;

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="btn btn-icon btn-ghost btn-sm disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        {pages[0] > 1 && (
          <>
            <PageBtn n={1} current={page} onClick={onPageChange} />
            {pages[0] > 2 && <span className="px-1 text-slate-400">…</span>}
          </>
        )}
        {pages.map(n => <PageBtn key={n} n={n} current={page} onClick={onPageChange} />)}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
            <PageBtn n={totalPages} current={page} onClick={onPageChange} />
          </>
        )}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="btn btn-icon btn-ghost btn-sm disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function PageBtn({ n, current, onClick }) {
  return (
    <button
      onClick={() => onClick(n)}
      className={clsx('w-8 h-8 rounded text-sm font-medium transition-colors', {
        'bg-primary-600 text-white': n === current,
        'text-slate-600 hover:bg-slate-100': n !== current,
      })}
    >
      {n}
    </button>
  );
}
