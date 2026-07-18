import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';

export default function RegistrationSection() {
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
    <section ref={ref} id="о-клубе" className="bg-[#F5F7FA] py-10 px-5">
      <div className="w-full">
        {/* Info block about referral */}
        <div className={`bg-white rounded-2xl p-6 shadow-card text-center transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Регистрация по реферальной ссылке
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Чтобы присоединиться к клубу, получите персональную реферальную ссылку от участника сети. Регистрация доступна только по приглашению.
          </p>
          <button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-button transition-all active:scale-[0.98]">
            Войти
          </button>
        </div>
      </div>
    </section>
  );
}
