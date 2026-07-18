import { useState } from 'react';
import { LayoutDashboard, FileText, Coins, MessageSquare, LogOut, Menu, X, Briefcase } from 'lucide-react';
import CabinetHome from './CabinetHome';
import CabinetApplications from './CabinetApplications';
import CabinetBonuses from './CabinetBonuses';
import CabinetChat from './CabinetChat';
import CabinetServices from './CabinetServices';
import CabinetStructure from './CabinetStructure';
import { useAuth } from '../../context/AuthContext';

export type CabinetTab = 'home' | 'services' | 'structure' | 'applications' | 'bonuses' | 'chat';

interface MenuItem {
  id: CabinetTab;
  label: string;
  icon: React.ElementType;
}

const bottomNavItems: { id: CabinetTab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Главная', icon: LayoutDashboard },
  { id: 'services', label: 'Услуги', icon: Briefcase },
  { id: 'applications', label: 'Заявки', icon: FileText },
  { id: 'bonuses', label: 'Бонусы', icon: Coins },
  { id: 'chat', label: 'Чаты', icon: MessageSquare },
];

const sideMenuItems: MenuItem[] = [
  { id: 'home', label: 'Главная', icon: LayoutDashboard },
  { id: 'structure', label: 'Структура', icon: Briefcase },
  { id: 'applications', label: 'Заявки', icon: FileText },
  { id: 'bonuses', label: 'Бонусы', icon: Coins },
  { id: 'chat', label: 'Чаты', icon: MessageSquare },
];

interface CabinetPageProps {
  onLogout: () => void;
}

export default function CabinetPage({ onLogout }: CabinetPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CabinetTab>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatType, setChatType] = useState<'main' | 'bonus'>('main');

  const userInitials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || '??';

  const handleNavigateToChat = (type: 'main' | 'bonus') => {
    setChatType(type);
    setActiveTab('chat');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <CabinetHome />;
      case 'services': return <CabinetServices onNavigateToChat={handleNavigateToChat} />;
      case 'structure': return <CabinetStructure />;
      case 'applications': return <CabinetApplications />;
      case 'bonuses': return <CabinetBonuses />;
      case 'chat': return <CabinetChat initialChatType={chatType} />;
      default: return <CabinetHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="w-full max-w-[430px] sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Личный кабинет</h1>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">{userInitials}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full max-w-[430px] sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] mx-auto">
        {renderContent()}
      </main>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-xl">
            {/* Menu Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
              <button onClick={() => setMenuOpen(false)} className="w-10 h-10 flex items-center justify-center -ml-2">
                <X size={22} className="text-gray-700" />
              </button>
              <span className="text-base font-semibold text-gray-900">Личный кабинет</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">{userInitials}</span>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="py-2">
              {sideMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMenuOpen(false);
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                    activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-[15px]">{item.label}</span>
                </button>
              ))}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="text-[15px]">Выйти</span>
                </button>
              </div>
            </nav>

            {/* Programs */}
            <div className="px-4 py-3 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Программы</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-700">Обработка персональных данных</span>
                  <span className="text-xs text-emerald-500 font-medium">Принято<br/>15.03.2026</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="px-4 py-3 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Опасная зона</h3>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm">Выйти из аккаунта</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] mx-auto bg-white border-t border-gray-100 z-40">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for tab bar */}
      <div className="h-16" />
    </div>
  );
}
