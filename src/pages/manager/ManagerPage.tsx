import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Trash2, Zap, LogOut, MessageSquare, RefreshCw } from 'lucide-react';
import { api, type ChatMessage, type SupportChatItem } from '../../api/client';

const TOKEN_KEY = 'ip_support_token';
const POLL = 4000;

export default function ManagerPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [chats, setChats] = useState<SupportChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [templates, setTemplates] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  const handleLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await api.supportLogin(login.trim(), password);
      sessionStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setChats([]);
    setActiveChatId(null);
  };

  const loadChats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.supportListChats(token);
      setChats(res.chats);
    } catch {
      /* token expired */
    }
  }, [token]);

  useEffect(() => {
    loadChats();
    const t = setInterval(loadChats, POLL * 2);
    return () => clearInterval(t);
  }, [loadChats]);

  const loadMessages = useCallback(async () => {
    if (!token || !activeChatId) return;
    try {
      const res = await api.listMessages(activeChatId, token);
      setMessages([...res.messages].reverse());
    } catch {
      /* transient */
    }
  }, [token, activeChatId]);

  useEffect(() => {
    setMessages([]);
    loadMessages();
    const t = setInterval(loadMessages, POLL);
    return () => clearInterval(t);
  }, [loadMessages]);

  useEffect(() => {
    api.listTemplates('support')
      .then((rows) => setTemplates(rows.map((r) => r.text)))
      .catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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
    if (!body || !token || !activeChatId) return;
    setInput('');
    try {
      await api.sendMessage(activeChatId, body, token, crypto.randomUUID());
      await loadMessages();
      loadChats();
    } catch {
      setInput(body);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!token || !activeChatId) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await api.deleteMessage(activeChatId, messageId, token);
    } catch {
      loadMessages();
    }
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const ownerName = (c: SupportChatItem) => {
    const name = [c.owner.first_name, c.owner.last_name].filter(Boolean).join(' ');
    return name || c.owner.phone || `Клиент #${c.owner.id}`;
  };

  // ---------- Login screen ----------
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Кабинет менеджера</h1>
            <p className="text-sm text-gray-500 mt-1">Вход для сотрудников поддержки</p>
          </div>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Пароль"
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={busy || !login || !password}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            ВОЙТИ
          </button>
          <p className="text-center text-xs text-gray-400">
            <a href="/" className="text-blue-500">← на сайт</a>
          </p>
        </div>
      </div>
    );
  }

  const activeChat = chats.find((c) => c.id === activeChatId);

  // ---------- Workspace ----------
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[900px] bg-[#F5F7FA] shadow-2xl flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between flex-shrink-0">
          <h1 className="text-base font-semibold text-gray-900">Кабинет менеджера</h1>
          <div className="flex items-center gap-2">
            <button onClick={loadChats} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-500">
              <RefreshCw size={18} />
            </button>
            <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          {/* Chat list */}
          <div className="w-[280px] bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0">
            {chats.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-8 px-4">Чатов пока нет</p>
            )}
            {chats.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                  activeChatId === c.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 truncate">{ownerName(c)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    c.type === 'bonus' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {c.type === 'bonus' ? 'Бонусы' : c.type === 'insurance' ? 'Страховка' : 'Основной'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {c.last_message_at ? fmtTime(c.last_message_at) : 'пустой'}
                </div>
              </button>
            ))}
          </div>

          {/* Conversation */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2">
                <MessageSquare size={40} />
                <p className="text-sm text-gray-400">Выберите чат слева</p>
              </div>
            ) : (
              <>
                <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900">{ownerName(activeChat)}</span>
                  {activeChat.owner.phone && (
                    <span className="text-xs text-gray-400 ml-2">+{activeChat.owner.phone}</span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-xs text-gray-400 mt-8">Сообщений пока нет</p>
                  )}
                  {messages.map((msg) => {
                    const fromMe = msg.role === 'support';
                    return (
                      <div key={msg.id} className={`group flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-1.5 max-w-[75%] ${fromMe ? 'flex-row-reverse' : ''}`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              fromMe
                                ? 'bg-blue-500 text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                            <p className={`text-[10px] mt-1 ${fromMe ? 'text-blue-200' : 'text-gray-400'}`}>
                              {fmtTime(msg.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            title="Удалить сообщение"
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <div className="px-4 py-3 bg-white border-t border-gray-100 relative flex-shrink-0">
                  {showTemplates && templates.length > 0 && (
                    <div
                      ref={templatesRef}
                      className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-10"
                    >
                      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Быстрые ответы
                      </p>
                      {templates.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setInput(t);
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
                      title="Быстрые ответы"
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        showTemplates ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <Zap size={20} />
                    </button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ответ клиенту..."
                      className="flex-1 h-10 px-4 bg-gray-100 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
