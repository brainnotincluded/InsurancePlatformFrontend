import { useEffect, useRef, useState } from 'react';
import { Timer, Share2, Gift, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Timer,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    title: 'Регистрация за 1 минуту',
    description: 'Быстрое создание личного кабинета без лишних сложностей.',
  },
  {
    icon: Share2,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    title: 'Поделитесь своей ссылкой',
    description: 'Приглашайте друзей, родственников и коллег.',
  },
  {
    icon: Gift,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'Вознаграждение за каждое оформление',
    description: 'Бонусы начисляются автоматически после покупки полиса.',
  },
  {
    icon: TrendingUp,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    title: 'Дополнительный доход без вложений',
    description: 'Рекомендуйте полезный сервис и получайте стабильное вознаграждение.',
  },
];

export default function SupportSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#F5F7FA] py-10 px-5">
      <div className="w-full">
        <h2 className={`text-xl font-bold text-gray-900 leading-snug mb-6 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Как начать зарабатывать
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${100 + i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center flex-shrink-0`}>
                <step.icon size={22} className={step.iconColor} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 leading-snug">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
