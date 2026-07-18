import { useEffect, useMemo, useState } from 'react';
import { Search, Users, Copy, Check } from 'lucide-react';
import { api, type StructureMember } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU');

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export default function CabinetStructure() {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [direct, setDirect] = useState(0);
  const [refLink, setRefLink] = useState('');
  const [levels, setLevels] = useState<Record<string, StructureMember[]>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    api.getStructure(accessToken).then((s) => {
      setTotal(s.total);
      setDirect(s.levels.find((l) => l.level === 1)?.count ?? 0);
      setRefLink(s.referral_link);
    }).catch(() => undefined);
    api.getStructureList(accessToken).then((d) => setLevels(d.levels)).catch(() => undefined);
  }, [accessToken]);

  const sortedLevels = useMemo(
    () => Object.keys(levels).map(Number).sort((a, b) => a - b),
    [levels],
  );

  const filter = (members: StructureMember[]) =>
    query.trim()
      ? members.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()))
      : members;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Stats */}
      <div className="text-sm text-gray-600">
        Приглашено вами: <span className="font-bold text-gray-900">{direct}</span> · Всего в сети:{' '}
        <span className="font-bold text-gray-900">{total}</span>
      </div>

      {/* Referral link */}
      {refLink && (
        <button
          onClick={copyLink}
          className="w-full bg-blue-50 hover:bg-blue-100 rounded-xl px-4 py-3 flex items-center gap-2 transition-colors"
        >
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-blue-500" />}
          <span className="text-sm text-blue-700 truncate flex-1 text-left">{refLink}</span>
          <span className="text-xs text-blue-500 font-medium flex-shrink-0">
            {copied ? 'Скопировано' : 'Копировать'}
          </span>
        </button>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Levels */}
      {sortedLevels.length === 0 && (
        <p className="text-xs text-gray-400 py-8 text-center bg-white rounded-xl shadow-sm">
          Ваша сеть пуста. Поделитесь реферальной ссылкой, чтобы пригласить первых участников.
        </p>
      )}
      {sortedLevels.map((level) => {
        const members = filter(levels[String(level)] ?? []);
        if (members.length === 0) return null;
        return (
          <div key={level}>
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-blue-500" />
              <span className="text-sm font-bold text-gray-900">
                {level}-й уровень · {members.length}
              </span>
            </div>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">{initials(m.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-500">
                      {fmtDate(m.joined_at)} · {m.structure_count} приглашённых
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    m.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {m.status === 'active' ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
