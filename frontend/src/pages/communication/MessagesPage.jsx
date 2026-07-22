import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Inbox, Send, Pencil, Trash2, X, Search, ArrowLeft, Reply } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

dayjs.extend(relativeTime);

function avatar(u) {
  if (!u) return '?';
  return `${u.profile?.firstName?.[0] ?? ''}${u.profile?.lastName?.[0] ?? ''}`.toUpperCase() || '?';
}
function fullName(u) {
  if (!u) return 'Unknown';
  return `${u.profile?.firstName ?? ''} ${u.profile?.lastName ?? ''}`.trim() || u.email || 'Unknown';
}

// ── Compose Modal ─────────────────────────────────────────────────────────────
function ComposeModal({ open, onClose, replyTo }) {
  const qc   = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      toUserId: replyTo ? String(replyTo.fromUserId?._id ?? replyTo.fromUserId) : '',
      subject:  replyTo ? `Re: ${replyTo.subject}` : '',
      body:     '',
    },
  });

  const [contactSearch, setContactSearch] = useState('');
  const [toUser, setToUser] = useState(replyTo ? replyTo.fromUserId : null);

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', contactSearch],
    queryFn:  () => api.get('/communication/messages/contacts', { params: { search: contactSearch } }).then(r => r.data.data),
    enabled:  contactSearch.length >= 2,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (body) => api.post('/communication/messages', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages-inbox'] });
      qc.invalidateQueries({ queryKey: ['messages-sent'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
      toast.success('Message sent');
      onClose(); reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onSubmit = (data) => {
    mutation.mutate({
      toUserId: data.toUserId,
      subject:  data.subject,
      body:     data.body,
      parentId: replyTo?._id,
      threadId: replyTo?.threadId,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay"/>
        <Dialog.Content className="dialog-content max-w-lg">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{replyTo ? 'Reply' : 'New Message'}</Dialog.Title>
            <Dialog.Close className="btn-icon"><X size={16}/></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="dialog-body space-y-4">
            {/* To field */}
            <div className="form-group">
              <label className="form-label">To *</label>
              {toUser
                ? (
                  <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">{avatar(toUser)}</div>
                    <span className="text-sm font-medium text-slate-700 flex-1">{fullName(toUser)}</span>
                    {!replyTo && (
                      <button type="button" onClick={() => { setToUser(null); setValue('toUserId',''); setContactSearch(''); }} className="btn-icon text-slate-400"><X size={12}/></button>
                    )}
                  </div>
                )
                : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      className="form-input pl-8"
                      placeholder="Search by name…"
                    />
                    {contacts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 divide-y divide-slate-100">
                        {contacts.filter(c => String(c._id) !== String(user?._id)).map(c => (
                          <button key={c._id} type="button"
                            onClick={() => { setToUser(c); setValue('toUserId', c._id); setContactSearch(''); }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{avatar(c)}</div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{fullName(c)}</p>
                              <p className="text-xs text-slate-400 capitalize">{c.role?.replace(/_/g,' ')}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              <input type="hidden" {...register('toUserId', { required: true })}/>
              {errors.toUserId && <p className="form-error">Select a recipient</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input {...register('subject', { required: true })} className="form-input" placeholder="Subject…"/>
              {errors.subject && <p className="form-error">Required</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea {...register('body', { required: true })} className="form-textarea" rows={6} placeholder="Write your message…"/>
              {errors.body && <p className="form-error">Required</p>}
            </div>

            <div className="dialog-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-md">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-md">
                <Send size={14}/> {mutation.isPending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Thread View ───────────────────────────────────────────────────────────────
function ThreadView({ message, onBack, onReply }) {
  const user = useAuthStore(s => s.user);

  const { data: thread = [] } = useQuery({
    queryKey: ['thread', message?.threadId ?? message?._id],
    queryFn:  () => api.get(`/communication/messages/thread/${message.threadId ?? message._id}`).then(r => r.data.data),
    enabled:  !!message,
    staleTime: 0,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-slate-200">
        <button onClick={onBack} className="btn-icon text-slate-400 hover:text-slate-700"><ArrowLeft size={16}/></button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{message?.subject}</p>
          <p className="text-xs text-slate-400">{thread.length} message{thread.length !== 1 ? 's' : ''} in thread</p>
        </div>
        <button onClick={() => onReply(message)} className="btn btn-ghost btn-sm">
          <Reply size={14}/> Reply
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.map(msg => {
          const isMe = String(msg.fromUserId?._id ?? msg.fromUserId) === String(user?._id);
          return (
            <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {avatar(isMe ? msg.fromUserId : msg.fromUserId)}
              </div>
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-4 py-3 text-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>
                <p className="text-xs text-slate-400">{dayjs(msg.createdAt).fromNow()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const qc   = useQueryClient();
  const user = useAuthStore(s => s.user);

  const [tab,       setTab]       = useState('inbox');
  const [compose,   setCompose]   = useState(false);
  const [replyTo,   setReplyTo]   = useState(null);
  const [activeMsg, setActiveMsg] = useState(null);

  const { data: inboxData, isLoading: loadingInbox } = useQuery({
    queryKey: ['messages-inbox'],
    queryFn:  () => api.get('/communication/messages/inbox').then(r => r.data),
    staleTime: 30_000,
  });

  const { data: sentData, isLoading: loadingSent } = useQuery({
    queryKey: ['messages-sent'],
    queryFn:  () => api.get('/communication/messages/sent').then(r => r.data),
    staleTime: 30_000,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/communication/messages/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages-inbox'] });
      qc.invalidateQueries({ queryKey: ['messages-sent'] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const messages = tab === 'inbox' ? (inboxData?.data ?? []) : (sentData?.data ?? []);
  const isLoading = tab === 'inbox' ? loadingInbox : loadingSent;
  const unread    = inboxData?.unreadCount ?? 0;

  const handleOpen = (msg) => { setActiveMsg(msg); };
  const handleBack = () => { setActiveMsg(null); qc.invalidateQueries({ queryKey: ['messages-inbox'] }); };
  const handleReply = (msg) => { setReplyTo(msg); setCompose(true); };
  const handleClose = () => { setCompose(false); setReplyTo(null); };

  if (activeMsg) {
    return (
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        <ThreadView message={activeMsg} onBack={handleBack} onReply={handleReply}/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Direct messages between staff, teachers, and parents</p>
        </div>
        <button onClick={() => { setReplyTo(null); setCompose(true); }} className="btn btn-primary btn-md">
          <Pencil size={14}/> Compose
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { key: 'inbox', label: 'Inbox', icon: Inbox,   count: unread },
          { key: 'sent',  label: 'Sent',  icon: Send,    count: 0 },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <t.icon size={14}/>
            {t.label}
            {t.count > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div className="card overflow-hidden">
        {isLoading
          ? <div className="p-4 space-y-2">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-16 rounded-lg"/>)}</div>
          : messages.length === 0
            ? (
              <div className="card-body text-center py-16 text-slate-400">
                <Inbox size={36} className="mx-auto mb-3 text-slate-300"/>
                <p className="font-medium">{tab === 'inbox' ? 'Your inbox is empty' : 'No sent messages'}</p>
                {tab === 'inbox' && <p className="text-sm mt-1">Messages from other users will appear here.</p>}
              </div>
            )
            : (
              <div className="divide-y divide-slate-100">
                {messages.map(msg => {
                  const other     = tab === 'inbox' ? msg.fromUserId : msg.toUserId;
                  const isUnread  = tab === 'inbox' && !msg.readByRecipient;
                  return (
                    <div key={msg._id}
                      className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${isUnread ? 'bg-primary-50/40' : ''}`}
                      onClick={() => handleOpen(msg)}>
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isUnread ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {avatar(other)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {fullName(other)}
                          </p>
                          <p className="text-xs text-slate-400 shrink-0">{dayjs(msg.createdAt).fromNow()}</p>
                        </div>
                        <p className={`text-sm truncate ${isUnread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                          {msg.subject}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{msg.body}</p>
                      </div>

                      {isUnread && <div className="w-2 h-2 rounded-full bg-primary-600 shrink-0"/>}

                      <button
                        onClick={e => { e.stopPropagation(); deleteMut.mutate(msg._id); }}
                        className="btn-icon text-slate-300 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  );
                })}
              </div>
            )
        }
      </div>

      <ComposeModal open={compose} onClose={handleClose} replyTo={replyTo}/>
    </div>
  );
}
