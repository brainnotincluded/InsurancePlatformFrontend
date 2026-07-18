import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Plus } from 'lucide-react';
import { api, type Application } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const PRODUCT_META: Record<string, { label: string; icon: string }> = {
  osago: { label: 'ОСАГО', icon: '🚗' },
  kasko: { label: 'КАСКО', icon: '🚙' },
  property: { label: 'Имущество', icon: '🏠' },
  personal: { label: 'Личное страхование', icon: '🛡️' },
  pds: { label: 'ПДС', icon: '💰' },
  legal: { label: 'Юридическая защита', icon: '⚖️' },
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В обработке',
  documents_needed: 'Нужны документы',
  calculation_ready: 'Расчёт готов',
  paid: 'Оплачено',
  policy_issued: 'Полис выдан',
  rejected: 'Отклонено',
  error: 'Ошибка',
};

const ACTIVE_COLOR: Record<string, string> = {
  new: 'text-blue-500',
  in_progress: 'text-blue-500',
  documents_needed: 'text-amber-500',
  calculation_ready: 'text-emerald-500',
  paid: 'text-emerald-500',
  policy_issued: 'text-emerald-600',
  rejected: 'text-red-500',
  error: 'text-red-500',
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU');

export default function CabinetApplications() {
  const { accessToken } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = () => {
    if (!accessToken) return;
    api.listApplications(accessToken).then(setApps).catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const handleCreate = async (product: string) => {
    if (!accessToken || creating) return;
    setCreating(true);
    try {
      await api.createApplication(product, accessToken);
      setShowNew(false);
      load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-4 py-5 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Мои заявки</h2>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="flex items-center gap-1 text-sm text-blue-600 font-medium"
        >
          <Plus size={16} /> Создать
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Выберите продукт
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PRODUCT_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => handleCreate(key)}
                disabled={creating}
                className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-blue-50 rounded-xl text-sm text-gray-700 hover:text-blue-700 transition-colors disabled:opacity-50"
              >
                <span>{meta.icon}</span> {meta.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {apps.length === 0 ? (
        <p className="text-xs text-gray-400 py-8 text-center bg-white rounded-2xl shadow-sm">
          Заявок пока нет. Нажмите «Создать», чтобы оформить первую.
        </p>
      ) : (
        apps.map((app) => {
          const meta = PRODUCT_META[app.product] ?? { label: app.product, icon: '📄' };
          const status = STATUS_LABELS[app.status] ?? app.status;
          const color = ACTIVE_COLOR[app.status] ?? 'text-gray-400';
          const done = app.status === 'policy_issued' || app.status === 'paid';
          return (
            <div key={app.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
                    <span className="text-[10px] text-gray-400">{app.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {done ? (
                      <CheckCircle size={12} className="text-emerald-500" />
                    ) : (
                      <Clock size={12} className={color} />
                    )}
                    <span className={`text-xs font-medium ${color}`}>{status}</span>
                  </div>
                  {app.manager_comment && (
                    <div className="text-xs text-gray-500 mt-1 italic">{app.manager_comment}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{fmtDate(app.created_at)}</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
