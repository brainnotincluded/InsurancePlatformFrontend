import { useEffect, useRef, useState } from 'react';

interface Level {
  percent: string;
  label: string;
  sublabel: string;
  color: string;
  count: number;
  iconSize: number;
  iconColor: string;
}

const levels: Level[] = [
  { percent: '3%', label: 'со страховок', sublabel: 'своих', color: 'text-blue-500', count: 4, iconSize: 34, iconColor: '#34D399' },
  { percent: '4%', label: 'со страховок', sublabel: '1 поколения', color: 'text-emerald-500', count: 4, iconSize: 34, iconColor: '#A78BFA' },
  { percent: '2%', label: 'со страховок', sublabel: '2 поколения', color: 'text-blue-400', count: 5, iconSize: 30, iconColor: '#FB923C' },
  { percent: '1%', label: 'со страховок', sublabel: '3 поколения', color: 'text-gray-500', count: 6, iconSize: 28, iconColor: '#9CA3AF' },
];

function PersonIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" fill={color} opacity="0.15" />
      <circle cx="22" cy="22" r="20" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="22" cy="16" r="7" fill={color} />
      <path d="M10 36c0-6.627 5.373-12 12-12s12 5.373 12 12" fill={color} />
    </svg>
  );
}

export default function BonusSystemSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const maxCols = 6;

  return (
    <section ref={sectionRef} className="bg-white py-10 px-5">
      <div className="w-full">
        <h2 className={`text-xl font-bold text-gray-900 text-center mb-8 leading-snug transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Вы получаете бонусы не только за свои страховки, но и за страховки друзей
        </h2>

        {/* Levels with grid-aligned icons */}
        <div className="space-y-5">
          {levels.map((level, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              {/* Percent block */}
              <div className="w-[72px] flex-shrink-0">
                <span className={`text-3xl font-extrabold ${level.color}`}>{level.percent}</span>
                <span className="block text-[11px] text-gray-400 leading-tight">{level.label}</span>
                <span className="block text-[11px] text-gray-400 leading-tight">{level.sublabel}</span>
              </div>

              {/* Icons grid — aligned left in fixed columns */}
              <div
                className="flex-1 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
                }}
              >
                {[...Array(level.count)].map((_, j) => (
                  <div key={j} className="flex flex-col items-center relative">
                    <PersonIcon color={level.iconColor} size={level.iconSize} />
                    {i === 1 && j === 4 && (
                      <span className="absolute -top-1 -right-1 text-[10px] text-blue-500 font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        +5
                      </span>
                    )}
                  </div>
                ))}
                {/* Empty cells to fill grid (keeps alignment) */}
                {[...Array(maxCols - level.count)].map((_, j) => (
                  <div key={`empty-${j}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
