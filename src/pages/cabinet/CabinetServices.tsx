import { useState } from 'react';
import { Car, Home, Heart, Wallet, ChevronRight, Landmark, Scale } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface ServiceItem {
  id: string;
  product: string | null;
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const services: ServiceItem[] = [
  { id: 'osago', product: 'osago', label: 'ОСАГО', description: 'Оформить заявку на ОСАГО', icon: Car, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  { id: 'kasko', product: 'kasko', label: 'КАСКО', description: 'Оформить заявку на КАСКО', icon: Car, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
  { id: 'personal', product: 'personal', label: 'Страхование жизни', description: 'Оформить страхование жизни', icon: Heart, iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
  { id: 'property', product: 'property', label: 'Страхование имущества', description: 'Застраховать квартиру или дом', icon: Home, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
  { id: 'pds', product: 'pds', label: 'ПДС', description: 'Пенсионные накопления', icon: Landmark, iconColor: 'text-violet-500', iconBg: 'bg-violet-50' },
  { id: 'legal', product: 'legal', label: 'Юридическая защита', description: 'Помощь юриста по страховым спорам', icon: Scale, iconColor: 'text-cyan-500', iconBg: 'bg-cyan-50' },
  { id: 'withdraw', product: null, label: 'Вывод бонусов', description: 'Обменять бонусы на подарочные сертификаты', icon: Wallet, iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
];

interface CabinetServicesProps {
  onNavigateToChat: (chatType: 'main' | 'bonus') => void;
}

export default function CabinetServices({ onNavigateToChat }: CabinetServicesProps) {
  const { accessToken } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (service: ServiceItem) => {
    if (!accessToken || busyId) return;
    setError(null);
    if (service.product === null) {
      onNavigateToChat('bonus');
      return;
    }
    setBusyId(service.id);
    try {
      await api.createApplication(service.product, accessToken);
      onNavigateToChat('main');
    } catch {
      setError('Не удалось создать заявку. Попробуйте ещё раз.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4 py-5 space-y-3">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Услуги</h2>
      <p className="text-sm text-gray-500 mb-4">Выберите услугу, чтобы начать оформление</p>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => handleClick(service)}
          disabled={busyId !== null}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 text-left hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center flex-shrink-0`}>
            <service.icon size={22} className={service.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">{service.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {busyId === service.id ? 'Создаём заявку...' : service.description}
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}
