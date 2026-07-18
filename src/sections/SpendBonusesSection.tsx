import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Gift } from 'lucide-react';

export default function SpendBonusesSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const shopLogos = [
    { src: '/logo-ozon.png', name: 'Ozon' },
    { src: '/logo-wildberries.png', name: 'Wildberries' },
    { src: '/logo-magnit.png', name: 'Магнит' },
    { src: '/logo-pyaterochka.png', name: 'Пятёрочка' },
  ];

  return (
    <section ref={ref} className="bg-[#F5F7FA] py-10 px-5">
      <div className="w-full">
        <h2 className={`text-xl font-bold text-gray-900 text-center mb-6 leading-snug transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Тратьте бонусы удобным способом
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1 - На страховку */}
          <div className={`bg-white rounded-2xl p-5 shadow-card flex items-center gap-4 transition-all duration-500 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={28} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">На страховку</h3>
              <p className="text-sm text-gray-500">Оплачивайте полисы бонусами</p>
            </div>
          </div>

          {/* Card 2 - На подарочные сертификаты */}
          <div className={`bg-white rounded-2xl p-5 shadow-card flex items-start gap-4 transition-all duration-500 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Gift size={28} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900">На подарочные сертификаты</h3>
              <p className="text-sm text-gray-500 mb-3">Выбирайте из популярных магазинов</p>
              <div className="flex items-center gap-2 flex-wrap">
                {shopLogos.map((logo, i) => (
                  <div key={i} className="h-7 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 flex items-center">
                    <img src={logo.src} alt={logo.name} className="h-4 w-auto object-contain" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
