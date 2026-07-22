import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Send, Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

function ConversationItem({ conv, active, onSelect, onDelete }) {
  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        active ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
      }`}
      onClick={() => onSelect(conv._id)}
    >
      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-indigo-500' : 'text-slate-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{conv.title}</p>
        <p className="text-2xs text-slate-400">{dayjs(conv.updatedAt).fromNow()}</p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(conv._id); }}
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
        title="Delete"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        isUser ? 'bg-primary-600 text-white' : 'bg-indigo-100 text-indigo-700'
      }`}>
        {isUser ? 'Y' : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
        isUser
          ? 'bg-primary-600 text-white rounded-tr-sm'
          : 'bg-slate-100 text-slate-800 rounded-tl-sm'
      }`}>
        {msg.content}
        {msg.streaming && <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5 -mb-0.5 rounded-sm" />}
      </div>
    </div>
  );
}

export default function AIChatPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qClient = useQueryClient();
  const { accessToken } = useAuthStore();

  const [convId, setConvId]         = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [streaming, setStreaming]   = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const bottomRef = useRef(null);
  const abortRef  = useRef(null);

  // List of conversations
  const { data: convList = { data: [] }, refetch: refetchList } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn:  () => api.get('/ai/conversations').then(r => r.data),
    staleTime: 30_000,
  });

  // If page loaded with ?q= param, auto-send
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !streaming) {
      setInput(q);
      navigate('/ai/chat', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = useCallback(async (id) => {
    setLoadingConv(true);
    try {
      const res = await api.get(`/ai/conversations/${id}`);
      const conv = res.data.data;
      setConvId(conv._id);
      setMessages(conv.messages ?? []);
    } finally {
      setLoadingConv(false);
    }
  }, []);

  const startNew = () => {
    setConvId(null);
    setMessages([]);
    setInput('');
  };

  const deleteConv = async (id) => {
    await api.delete(`/ai/conversations/${id}`);
    refetchList();
    if (convId === id) startNew();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    // Add streaming placeholder
    const placeholderIdx = (prev) => prev.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    setStreaming(true);
    let accText = '';
    let newConvId = convId;

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conversationId: convId, message: text }),
        signal: controller.signal,
      });

      if (!resp.ok) throw new Error('Stream request failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.conversationId) {
              newConvId = parsed.conversationId;
              setConvId(newConvId);
            }
            if (parsed.text) {
              accText += parsed.text;
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === 'assistant') {
                  updated[lastIdx] = { ...updated[lastIdx], content: accText, streaming: true };
                }
                return updated;
              });
            }
            if (parsed.error) {
              accText = `Error: ${parsed.error}`;
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === 'assistant') {
                  updated[lastIdx] = { role: 'assistant', content: accText };
                }
                return updated;
              });
            }
          } catch { /* non-JSON line */ }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
          }
          return updated;
        });
      }
    } finally {
      // Remove streaming flag
      setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m));
      setStreaming(false);
      refetchList();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -mt-4 -mx-4 lg:-mx-6 overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-3 border-b border-slate-100">
          <button onClick={startNew} className="btn btn-primary btn-sm w-full gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {convList.data.length === 0 && (
            <p className="text-xs text-slate-400 text-center mt-6 px-3">No conversations yet.</p>
          )}
          {convList.data.map(conv => (
            <ConversationItem
              key={conv._id}
              conv={conv}
              active={convId === conv._id}
              onSelect={loadConversation}
              onDelete={deleteConv}
            />
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Header */}
        <div className="h-12 flex items-center gap-2 px-4 bg-white border-b border-slate-200">
          <Bot className="w-4 h-4 text-indigo-600" />
          <span className="font-medium text-slate-700 text-sm">EduCore AI</span>
          {convId && <span className="text-xs text-slate-400 ml-2">#{convId.slice(-6)}</span>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingConv && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          )}

          {!loadingConv && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Bot className="w-7 h-7 text-indigo-600" />
              </div>
              <p className="text-base font-semibold text-slate-700">How can I help you today?</p>
              <p className="text-sm text-slate-400 max-w-sm">Ask me anything about your school — students, fees, attendance, staff, or ask me to draft a communication.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-200">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your school..."
              rows={1}
              className="flex-1 form-input resize-none text-sm min-h-[40px] max-h-32"
              style={{ lineHeight: '1.5' }}
              disabled={streaming}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="btn btn-primary btn-sm h-10 w-10 flex items-center justify-center p-0 flex-shrink-0"
            >
              {streaming
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
          <p className="text-2xs text-slate-400 mt-1.5 text-center">AI responses are generated and may not always be accurate. Verify critical information.</p>
        </div>
      </div>
    </div>
  );
}
