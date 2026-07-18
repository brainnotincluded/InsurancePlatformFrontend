import { useState } from 'react';
import { useLocation } from 'react-router';
import Header from './sections/Header';
import HeroSection from './sections/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import BonusSystemSection from './sections/BonusSystemSection';
import SpendBonusesSection from './sections/SpendBonusesSection';
import InsuranceCompaniesSection from './sections/InsuranceCompaniesSection';
import SupportSection from './sections/SupportSection';
import RegistrationSection from './sections/RegistrationSection';
import Footer from './sections/Footer';
import CabinetPage from './pages/cabinet/CabinetPage';
import ManagerPage from './pages/manager/ManagerPage';
import ChatWidget from './components/ChatWidget';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Manager workspace — standalone route, no landing chrome
  if (location.pathname === '/manager') {
    return <ManagerPage />;
  }

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  // Authenticated — show personal cabinet (no chat widget)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[430px] sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] mx-auto bg-[#F5F7FA] shadow-2xl shadow-gray-200/50 relative">
          <CabinetPage onLogout={logout} />
        </div>
      </div>
    );
  }

  // Main landing page
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[430px] sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] mx-auto bg-white shadow-2xl shadow-gray-200/50 relative">
        <Header onOpenAuth={() => openAuth('login')} />
        <main>
          <HeroSection onOpenAuth={() => openAuth('login')} />

          {/* Entry Button */}
          <div className="px-5 py-4 bg-mobile-gradient">
            <button
              onClick={() => openAuth('login')}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-base font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Войти в личный кабинет
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Вход по номеру телефона и коду из SMS
            </p>
          </div>

          <HowItWorksSection onOpenAuth={() => openAuth('register')} />
          <BonusSystemSection />
          <SpendBonusesSection />
          <InsuranceCompaniesSection />
          <SupportSection />
          <RegistrationSection />
        </main>
        <Footer />
        <ChatWidget />
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
      </div>
    </div>
  );
}
