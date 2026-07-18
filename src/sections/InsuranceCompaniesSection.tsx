import { useEffect, useRef, useState } from 'react';
import { Wallet, Users, Shield, Headphones } from 'lucide-react';

const advantages = [
  {
    icon: Wallet,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'Получайте бонусы за рекомендации',
    description: 'Приглашайте друзей и получайте вознаграждение за оформленные полисы.',
  },
  {
    icon: Users,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    title: 'Бонусы с 3 уровней рекомендаций',
    description: 'Получайте доход не только от своих приглашений, но и от рекомендаций вашей сети.',
  },
  {
    icon: Shield,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    title: 'Ведущие страховые компании',
    description: 'Все популярные виды страхования в одном месте.',
  },
  {
    icon: Headphones,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    title: 'Поддержка 24/7',
    description: 'Всегда на связи — поможем подобрать и оформить страховку.',
  },
];

export default function InsuranceCompaniesSection() {
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
    <section ref={ref} className="bg-white py-10 px-5">
      <div className="w-full">
        <h2 className={`text-xl font-bold text-gray-900 leading-snug mb-6 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Почему выбирают нас
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {advantages.map((adv, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: `${100 + i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${adv.iconBg} flex items-center justify-center flex-shrink-0`}>
                <adv.icon size={22} className={adv.iconColor} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 leading-snug">{adv.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mt-1">{adv.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
