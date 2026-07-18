import { useCallback, useEffect, useRef, useState } from 'react';
import { Shield, Coins, Send, Trash2, Zap } from 'lucide-react';
import { api, type ChatMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface CabinetChatProps {
  initialChatType?: 'main' | 'bonus';
}

const POLL_INTERVAL = 4000;

export default function CabinetChat({ initialChatType = 'main' }: CabinetChatProps) {
  const { accessToken } = useAuth();
  const [activeChat, setActiveChat] = useState<'main' | 'bonus'>(initialChatType);
  const [chatIds, setChatIds] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [templates, setTemplates] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Open (lazy-create) both chats once
  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const [main, bonus] = await Promise.all([
          api.openChat('main', accessToken),
          api.openChat('bonus', accessToken),
        ]);
        setChatIds({ main: main.id, bonus: bonus.id });
      } catch {
        /* token expired or network — keep empty */
      }
    })();
  }, [accessToken]);

  const chatId = chatIds[activeChat];

  const loadMessages = useCallback(async () => {
    if (!accessToken || !chatId) return;
    try {
      const res = await api.listMessages(chatId, accessToken);
      // backend returns newest-first — render oldest-first
      setMessages([...res.messages].reverse());
    } catch {
      /* ignore transient errors */
    }
  }, [accessToken, chatId]);

  useEffect(() => {
    setMessages([]);
    loadMessages();
    const t = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [loadMessages]);

  // Templates per chat type
  useEffect(() => {
    api.listTemplates(activeChat === 'bonus' ? 'bonus' : 'user')
      .then((rows) => setTemplates(rows.map((r) => r.text)))
      .catch(() => setTemplates([]));
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Close template picker on outside click
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
    const body = inputText.trim();
    if (!body || !accessToken || !chatId || sending) return;
    setSending(true);
    setInputText('');
    try {
      await api.sendMessage(chatId, body, accessToken, crypto.randomUUID());
      await loadMessages();
    } catch {
      setInputText(body); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!accessToken || !chatId) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await api.deleteMessage(chatId, messageId, accessToken);
    } catch {
      loadMessages(); // rollback
    }
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px-64px)]">
      {/* Chat Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        <button
          onClick={() => setActiveChat('main')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeChat === 'main' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <Shield size={16} />
          Страхование
        </button>
        <button
          onClick={() => setActiveChat('bonus')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeChat === 'bonus' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <Coins size={16} />
          Бонусы
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">
            Сообщений пока нет. Напишите первым — менеджер ответит вам здесь.
          </p>
        )}
        {messages.map((msg) => {
          const fromMe = msg.role === 'user';
          return (
            <div key={msg.id} className={`group flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-1.5 max-w-[80%] ${fromMe ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    fromMe
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  {msg.kind === 'file' && msg.file ? (
                    <a
                      href={msg.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-sm underline ${fromMe ? 'text-white' : 'text-blue-600'}`}
                    >
                      📎 {msg.file.name}
                    </a>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${fromMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {fmtTime(msg.created_at)}
                  </p>
                </div>
                {fromMe && (
                  <button
                    onClick={() => handleDelete(msg.id)}
                    title="Удалить сообщение"
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 relative">
        {showTemplates && templates.length > 0 && (
          <div
            ref={templatesRef}
            className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-10"
          >
            <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Шаблонные фразы
            </p>
            {templates.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setInputText(t);
                  setShowTemplates(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates((v) => !v)}
            title="Шаблонные фразы"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              showTemplates ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
            }`}
          >
            <Zap size={20} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Написать сообщение..."
            className="flex-1 h-10 px-4 bg-gray-100 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={handleSend}
            disabled={sending || !inputText.trim()}
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
