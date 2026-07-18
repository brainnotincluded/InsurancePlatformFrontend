import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '../components/Logo';

interface HeaderProps {
  onOpenAuth: () => void;
}

export default function Header({ onOpenAuth }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = ['О клубе', 'Как это работает', 'Страховые компании', 'Поддержка'];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Logo height={28} />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                const el = document.getElementById(item.toLowerCase().replace(/\s+/g, '-'));
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* CTA + Mobile menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAuth}
            className="hidden md:inline-flex h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all active:scale-95"
          >
            Войти
          </button>
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-3 px-4">
          {navItems.map((item) => (
            <button
              key={item}
              className="block w-full text-left py-2.5 text-sm text-gray-700 hover:text-blue-600"
              onClick={() => {
                setMobileOpen(false);
                const el = document.getElementById(item.toLowerCase().replace(/\s+/g, '-'));
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => { setMobileOpen(false); onOpenAuth(); }}
            className="mt-2 w-full h-10 bg-blue-600 text-white text-sm font-medium rounded-lg"
          >
            Войти
          </button>
        </div>
      )}
    </header>
  );
}
