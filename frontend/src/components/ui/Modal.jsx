import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import clsx from 'clsx';

export function Modal({ open, onClose, title, description, children, size = 'md' }) {
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={clsx(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full mx-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl',
            'animate-scale-in focus:outline-none',
            widths[size],
          )}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">{title}</Dialog.Title>
              {description && <Dialog.Description className="text-sm text-slate-500 mt-0.5">{description}</Dialog.Description>}
            </div>
            <button onClick={onClose} className="btn btn-icon btn-ghost ml-4">
              <X size={16} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
