import { useEffect, useRef, useState } from 'react';

interface Node {
  angle: number;
  bonus: string;
  bonusPos: 'left' | 'right' | 'top';
}

const nodes: Node[] = [
  { angle: -60, bonus: '+15', bonusPos: 'right' },
  { angle: -10, bonus: '+5', bonusPos: 'top' },
  { angle: 40, bonus: '+15', bonusPos: 'right' },
  { angle: 90, bonus: '+30', bonusPos: 'right' },
  { angle: 140, bonus: '+25', bonusPos: 'right' },
  { angle: 190, bonus: '', bonusPos: 'left' },
  { angle: 240, bonus: '+10', bonusPos: 'left' },
];

function PersonIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 44 44" fill="none" className="drop-shadow-md">
      <defs>
        <linearGradient id="personGrad" x1="0" y1="0" x2="44" y2="44">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="#DBEAFE" stroke="url(#personGrad)" strokeWidth="2" />
      <circle cx="22" cy="16" r="7" fill="url(#personGrad)" />
      <path d="M12 36c0-5.523 4.477-10 10-10s10 4.477 10 10" fill="url(#personGrad)" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="90" height="110" viewBox="0 0 80 96" fill="none" className="drop-shadow-xl">
      <defs>
        <linearGradient id="shieldGrad3D" x1="40" y1="4" x2="40" y2="83.2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="shieldGlow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#3B82F6" floodOpacity="0.3" />
        </filter>
      </defs>
      <path
        d="M40 4L8 20v24c0 18.2 13.7 35.2 32 39.2 18.3-4 32-21 32-39.2V20L40 4z"
        fill="url(#shieldGrad3D)"
        stroke="#1E40AF"
        strokeWidth="1.5"
        filter="url(#shieldGlow)"
      />
      {/* 3D highlight */}
      <path
        d="M40 8L14 22v20c0 14 10 27 26 31 16-4 26-17 26-31V22L40 8z"
        fill="white"
        opacity="0.12"
      />
      <path
        d="M30 48l8 8 14-14"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Random particle configs computed once at module load so render stays pure
const particles = [...Array(12)].map(() => ({
  width: 8 + Math.random() * 20,
  height: 8 + Math.random() * 20,
  left: Math.random() * 100,
  top: Math.random() * 100,
  animationDelay: Math.random() * 5,
  animationDuration: 3 + Math.random() * 4,
}));

export default function HeroSection({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const cx = 50;
  const cy = 48;
  const radius = 35;

  // Generate dashed connection lines between all nodes
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a1 = (nodes[i].angle * Math.PI) / 180;
      const a2 = (nodes[j].angle * Math.PI) / 180;
      lines.push({
        x1: cx + radius * Math.cos(a1),
        y1: cy + radius * Math.sin(a1),
        x2: cx + radius * Math.cos(a2),
        y2: cy + radius * Math.sin(a2),
      });
    }
  }

  return (
    <section ref={ref} className="relative bg-mobile-gradient overflow-hidden px-5 pt-6 pb-8">
      {/* Floating particles background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/10 animate-float"
            style={{
              width: `${p.width}px`,
              height: `${p.height}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.animationDelay}s`,
              animationDuration: `${p.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className={`flex items-center justify-center mb-4 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <svg width="80" height="52" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <path d="M8 85V20L28 8V85H8Z" fill="url(#logoGrad)" />
          <path d="M32 85V25L52 13V85H32Z" fill="url(#logoGrad)" opacity="0.7" />
          <path d="M108 50c0-22-18-38-38-38S32 28 32 50s18 38 38 38c12 0 22-5 30-14l-14-12c-4 5-10 8-16 8-12 0-22-10-22-22s10-22 22-22c6 0 12 3 16 8l14-12c-8-9-18-14-30-14-22 0-40 16-40 38s18 38 40 38c14 0 26-7 34-18l-14-10c-5 8-14 13-24 13z" fill="url(#logoGrad)" />
          <path d="M115 85V15h20v28l22-28h24l-28 34 28 36h-24l-22-28v28h-20z" fill="url(#logoGrad)" />
        </svg>
      </div>

      {/* Network diagram container */}
      <div className={`relative w-full max-w-[380px] mx-auto aspect-square transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        {/* SVG background with animated dashed lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Animated dashed connection lines */}
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="url(#lineGrad)"
              strokeWidth="0.7"
              strokeDasharray="3 3"
              opacity="0.6"
              className="animate-dash-flow"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
          {/* Animated outer circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius + 3}
            fill="none"
            stroke="#BFDBFE"
            strokeWidth="0.6"
            strokeDasharray="4 4"
            opacity="0.4"
            className="animate-spin-slow"
          />
          {/* Inner glow circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius - 8}
            fill="none"
            stroke="#DBEAFE"
            strokeWidth="0.4"
            strokeDasharray="2 6"
            opacity="0.5"
            className="animate-spin-reverse"
          />
        </svg>

        {/* Center shield with 3D hover */}
        <div
          className="absolute z-10 shield-3d"
          style={{
            left: `${cx}%`,
            top: `${cy}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="animate-pulse-glow">
            <ShieldIcon />
          </div>
        </div>

        {/* Person nodes with 3D pop */}
        {nodes.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = cx + radius * Math.cos(rad);
          const y = cy + radius * Math.sin(rad);

          return (
            <div
              key={i}
              className={`absolute z-20 transition-all duration-500 node-pop ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                transitionDelay: `${200 + i * 80}ms`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <div className="node-float">
                <PersonIcon />

                {/* Bonus badge */}
                {node.bonus && (
                  <div
                    className={`absolute bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-lg whitespace-nowrap ${
                      node.bonusPos === 'left' ? 'right-full mr-1 top-0' :
                      node.bonusPos === 'top' ? 'left-1/2 -translate-x-1/2 bottom-full mb-1' :
                      'left-full ml-1 top-0'
                    }`}
                  >
                    {node.bonus}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Floating big bonus labels */}
        <div
          className={`absolute z-30 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          style={{ left: '-5%', top: '15%', transitionDelay: '800ms', animation: 'float 4s ease-in-out infinite' }}
        >
          +1,000 бонусов
        </div>

        <div
          className={`absolute z-30 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          style={{ right: '-5%', bottom: '20%', transitionDelay: '900ms', animation: 'float 3.5s ease-in-out infinite 1s' }}
        >
          +3,000 бонусов
        </div>
      </div>

      {/* CTA - Login only */}
      <div className={`max-w-[380px] mx-auto mt-6 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={onOpenAuth}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-2xl shadow-button transition-all active:scale-[0.98]"
        >
          Войти
        </button>
      </div>
    </section>
  );
}
