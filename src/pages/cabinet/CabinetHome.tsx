import { useEffect, useState } from 'react';
import { TrendingUp, Users, BarChart3, ChevronRight } from 'lucide-react';
import { api, type Application } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const PRODUCT_LABELS: Record<string, string> = {
  osago: 'ОСАГО', kasko: 'КАСКО', property: 'Имущество',
  personal: 'Личное страхование', pds: 'ПДС', legal: 'Юридическая защита',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Новая', color: 'text-blue-500' },
  in_progress: { label: 'В обработке', color: 'text-blue-500' },
  documents_needed: { label: 'Нужны документы', color: 'text-amber-500' },
  calculation_ready: { label: 'Расчёт готов', color: 'text-emerald-500' },
  paid: { label: 'Оплачено', color: 'text-emerald-500' },
  policy_issued: { label: 'Полис выдан', color: 'text-emerald-600' },
  rejected: { label: 'Отклонено', color: 'text-red-500' },
  error: { label: 'Ошибка', color: 'text-red-500' },
};

const fmt = (v: string | number) => Number(v).toLocaleString('ru-RU');
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU');

export default function CabinetHome() {
  const { accessToken } = useAuth();
  const [balance, setBalance] = useState('0');
  const [invited, setInvited] = useState(0);
  const [network, setNetwork] = useState(0);
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    api.getBalance(accessToken).then((b) => setBalance(b.balance)).catch(() => undefined);
    api.getStructure(accessToken).then((s) => {
      setInvited(s.levels.find((l) => l.level === 1)?.count ?? 0);
      setNetwork(s.total);
    }).catch(() => undefined);
    api.listApplications(accessToken).then(setApps).catch(() => undefined);
  }, [accessToken]);

  const stats = [
    { label: 'Баланс бонусов', value: fmt(balance), color: 'text-gray-900', icon: BarChart3 },
    { label: 'Приглашено', value: String(invited), color: 'text-blue-600', icon: Users },
    { label: 'Всего в сети', value: String(network), color: 'text-emerald-600', icon: TrendingUp },
  ];

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
            <stat.icon size={16} className="text-gray-400 mb-1" />
            <div className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-gray-500 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ваш баланс бонусов</span>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{fmt(balance)}</span>
          <span className="text-sm text-gray-500 mb-1">Бонусов</span>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Последние заявки</h3>
        {apps.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">
            Заявок пока нет — создайте первую из раздела «Услуги»
          </p>
        ) : (
          <div className="space-y-3">
            {apps.slice(0, 5).map((a) => {
              const st = STATUS_LABELS[a.status] ?? { label: a.status, color: 'text-gray-400' };
              return (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {PRODUCT_LABELS[a.product] ?? a.product}
                    </div>
                    <div className="text-xs text-gray-400">{fmtDate(a.created_at)}</div>
                  </div>
                  <span className={`text-xs font-semibold ${st.color}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}
        <button className="w-full mt-3 py-2 text-sm text-blue-600 font-medium flex items-center justify-center gap-1">
          Все операции <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
