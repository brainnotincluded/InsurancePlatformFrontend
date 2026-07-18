import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Gift } from 'lucide-react';
import { api, type Accrual } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const fmt = (v: string | number) => Number(v).toLocaleString('ru-RU');
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU');

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает созревания',
  credited: 'Начислено',
  cancelled: 'Отменено',
};

export default function CabinetBonuses() {
  const { accessToken } = useAuth();
  const [balance, setBalance] = useState('0');
  const [pending, setPending] = useState('0');
  const [accruals, setAccruals] = useState<Accrual[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    api.getBalance(accessToken).then((b) => {
      setBalance(b.balance);
      setPending(b.pending_balance);
    }).catch(() => undefined);
    api.getAccruals(accessToken).then(setAccruals).catch(() => undefined);
  }, [accessToken]);

  const creditedTotal = accruals
    .filter((a) => a.status === 'credited')
    .reduce((sum, a) => sum + Number(a.amount), 0);

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Balance */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={16} className="text-blue-200" />
          <span className="text-xs text-blue-200">Баланс бонусов</span>
        </div>
        <div className="text-4xl font-extrabold mb-1">{fmt(balance)}</div>
        <div className="text-sm text-blue-200">Бонусов</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownLeft size={14} className="text-emerald-500" />
            <span className="text-xs text-gray-500">Начислено</span>
          </div>
          <div className="text-lg font-bold text-emerald-600">+{fmt(creditedTotal)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight size={14} className="text-amber-500" />
            <span className="text-xs text-gray-500">Созревает</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{fmt(pending)}</div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">История начислений</h3>
        {accruals.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center bg-white rounded-xl shadow-sm">
            Начислений пока нет — они появятся после оформления страховок вами и вашей сетью
          </p>
        ) : (
          <div className="space-y-2">
            {accruals.map((a) => (
              <div key={a.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.status === 'credited' ? 'bg-emerald-50' : 'bg-amber-50'
                }`}>
                  <ArrowDownLeft size={14} className={a.status === 'credited' ? 'text-emerald-500' : 'text-amber-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Бонус с {a.level}-го уровня · {a.percent}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {STATUS_LABELS[a.status] ?? a.status} · {fmtDate(a.created_at)}
                  </div>
                </div>
                <span className={`text-sm font-bold ${a.status === 'credited' ? 'text-emerald-600' : 'text-amber-500'}`}>
                  +{fmt(a.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
