import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Trash2, Zap } from 'lucide-react';
import { api, type ChatMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL = 5000;

export default function ChatWidget() {
  const { isAuthenticated, accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [templates, setTemplates] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Lazy-create main chat when authenticated
  useEffect(() => {
    if (!accessToken) {
      setChatId(null);
      return;
    }
    api.openChat('main', accessToken)
      .then((c) => setChatId(c.id))
      .catch(() => setChatId(null));
  }, [accessToken]);

  const loadMessages = useCallback(async () => {
    if (!accessToken || !chatId) return;
    try {
      const res = await api.listMessages(chatId, accessToken);
      setMessages([...res.messages].reverse());
    } catch {
      /* transient */
    }
  }, [accessToken, chatId]);

  useEffect(() => {
    if (!open) return;
    loadMessages();
    const t = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [open, loadMessages]);

  useEffect(() => {
    api.listTemplates('user')
      .then((rows) => setTemplates(rows.map((r) => r.text)))
      .catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  useEffect(() => {
    if (!showTemplates) return;
    const handler = (e: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTemplates]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput('');
    if (accessToken && chatId) {
      try {
        await api.sendMessage(chatId, body, accessToken, crypto.randomUUID());
        await loadMessages();
      } catch {
        setInput(body);
      }
    }
    setSending(false);
  };

  const handleDelete = async (messageId: string) => {
    if (!accessToken || !chatId) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await api.deleteMessage(chatId, messageId, accessToken);
    } catch {
      loadMessages();
    }
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-all active:scale-95"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-[320px] h-[450px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-blue-500 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">Поддержка</span>
        <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {!isAuthenticated ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-2">
            <p className="text-xs text-gray-500">
              Войдите в аккаунт, чтобы написать в поддержку и видеть историю сообщений.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 mt-6">
            Здравствуйте! Выберите шаблон или напишите свой вопрос.
          </p>
        ) : (
          messages.map((msg) => {
            const fromMe = msg.role === 'user';
            return (
              <div key={msg.id} className={`group flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-1 max-w-[85%] ${fromMe ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`px-3 py-2 rounded-xl text-xs ${
                      fromMe ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                    <p className={`text-[9px] mt-0.5 ${fromMe ? 'text-blue-200' : 'text-gray-400'}`}>
                      {fmtTime(msg.created_at)}
                    </p>
                  </div>
                  {fromMe && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      title="Удалить"
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isAuthenticated && (
        <div className="px-3 py-2 border-t border-gray-100 relative">
          {showTemplates && templates.length > 0 && (
            <div
              ref={templatesRef}
              className="absolute bottom-full left-2 right-2 mb-1.5 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-10 max-h-[180px] overflow-y-auto"
            >
              {templates.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setInput(t);
                    setShowTemplates(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowTemplates((v) => !v)}
              title="Шаблонные фразы"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                showTemplates ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <Zap size={16} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Написать..."
              className="flex-1 h-8 px-3 bg-gray-100 rounded-full text-xs placeholder:text-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white disabled:opacity-50"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
