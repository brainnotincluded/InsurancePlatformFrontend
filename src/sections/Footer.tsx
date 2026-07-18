import Logo from '../components/Logo';

export default function Footer() {
  const navItems = ['О клубе', 'Как это работает', 'Страховые компании', 'Поддержка', 'Войти'];

  return (
    <footer className="bg-[#1A1A2E] text-white py-8 px-4">
      <div className="w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Logo height={36} className="mb-2" />
          <span className="text-[10px] text-gray-400 uppercase tracking-[0.15em]">Первый Страховой Клуб</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-3 mb-6 md:flex-row md:justify-center md:gap-6">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                const el = document.getElementById(item.toLowerCase().replace(/\s+/g, '-'));
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-700 my-5" />

        {/* Contacts */}
        <div className="text-center space-y-1.5 mb-5">
          <p className="text-xs text-gray-400">Телефон: 8 (800) 000-00-00</p>
          <p className="text-xs text-gray-400">Email: info@1sk.club</p>
          <p className="text-xs text-gray-400">Режим работы: 24/7</p>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-[11px] text-gray-500">
            © 2025 1СК Первый Страховой Клуб. Все права защищены.
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            ООО «Первый Страховой Клуб». Лицензия СЛ № 0000000
          </p>
        </div>
      </div>
    </footer>
  );
}
