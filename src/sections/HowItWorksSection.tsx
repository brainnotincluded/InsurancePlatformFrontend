import { useEffect, useRef, useState } from 'react';

interface HowItWorksProps {
  onOpenAuth: () => void;
}

export default function HowItWorksSection({ onOpenAuth }: HowItWorksProps) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const insuranceTypes = [
    { label: 'КАСКО', color: 'bg-blue-500' },
    { label: 'ОСАГО', color: 'bg-blue-600' },
    { label: 'Имущество', color: 'bg-emerald-500' },
    { label: 'Страхование жизни', color: 'bg-purple-500' },
  ];

  const shopLogos = [
    { src: '/logo-ozon.png', name: 'Ozon' },
    { src: '/logo-wildberries.png', name: 'Wildberries' },
    { src: '/logo-magnit.png', name: 'Магнит' },
    { src: '/logo-pyaterochka.png', name: 'Пятёрочка' },
  ];

  return (
    <section
      ref={sectionRef}
      id="как-это-работает"
      className="bg-white py-10 px-5"
    >
      {/* Section Header */}
      <div className={`w-full transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <h2 className="text-[32px] font-extrabold text-gray-900 leading-tight mb-3">
          Как это<br />работает
        </h2>
        <p className="text-base text-gray-500 leading-relaxed">
          Всего 3 шага, чтобы получать<br />бонусы со своей сети
        </p>
      </div>

      {/* Hero image - car + shield + phone */}
      <div className={`mt-6 mb-8 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="w-full max-w-[640px] mx-auto">
          <img
            src="/how-it-works-hero.png"
            alt="Страховка автомобиля с полисом"
            className="w-full h-auto rounded-2xl"
            loading="lazy"
          />
        </div>
      </div>

      {/* Step 01 - Оформляйте страховки себе */}
      <div className={`w-full mb-6 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="bg-[#F8FAFF] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {/* Step number */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <span className="text-white text-base font-bold">01</span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                Оформляйте<br />страховки себе
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Выберите любой страховой продукт для себя от ведущих страховых компаний
              </p>
            </div>
          </div>

          {/* Insurance types */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            {insuranceTypes.map((type, i) => (
              <span key={i} className={`${type.color} text-white text-xs font-semibold px-3 py-1.5 rounded-lg`}>
                {type.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step 02 - Приглашайте друзей */}
      <div className={`w-full mb-6 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="bg-[#F8FAFF] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {/* Step number */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <span className="text-white text-base font-bold">02</span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                Приглашайте друзей
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Подключайте их в клуб и получайте бонусы с их покупок
              </p>
            </div>
          </div>

          {/* Network illustration */}
          <div className="mt-5 max-w-[560px] mx-auto">
            <img
              src="/how-it-works-network.png"
              alt="Реферальная сеть бонусов"
              className="w-full h-auto rounded-xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Step 03 - Получайте бонусы */}
      <div className={`w-full mb-8 transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="bg-[#F8FAFF] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {/* Step number */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <span className="text-white text-base font-bold">03</span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                Получайте бонусы
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Бонусы начисляются автоматически на ваш счёт
              </p>
            </div>
          </div>

          {/* Bonus illustration */}
          <div className="mt-5 max-w-[560px] mx-auto">
            <img
              src="/how-it-works-bonuses.png"
              alt="Бонусы и подарки"
              className="w-full h-auto rounded-xl"
              loading="lazy"
            />
          </div>

          {/* Shop logos */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {shopLogos.map((logo, i) => (
              <div key={i} className="h-8 px-2 py-1 bg-white rounded-lg border border-gray-100 flex items-center">
                <img src={logo.src} alt={logo.name} className="h-5 w-auto object-contain" loading="lazy" />
              </div>
            ))}
            <span className="text-gray-400 text-base">...</span>
          </div>
        </div>
      </div>

      {/* Social proof stats */}
      <div className={`w-full flex items-center justify-between px-2 mb-6 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold text-gray-900">7 142</span>
            <span className="block text-xs text-gray-500">человека уже в клубе</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900 block leading-tight">Надёжно и безопасно</span>
            <span className="text-xs text-gray-500 leading-tight">Работаем только с проверенными<br />страховыми компаниями</span>
          </div>
        </div>
      </div>

      {/* CTA - only Login */}
      <div className={`w-full transition-all duration-700 delay-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <button
          onClick={onOpenAuth}
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base font-semibold rounded-2xl shadow-button transition-all active:scale-[0.98]"
        >
          Войти
        </button>
      </div>
    </section>
  );
}
