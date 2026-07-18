interface LogoProps {
  className?: string;
  height?: number;
}

export default function Logo({ className = '', height = 32 }: LogoProps) {
  const width = height * 1.5;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 150 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`max-w-full h-auto ${className}`}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {/* 1 */}
      <path
        d="M8 85V20L28 8V85H8Z"
        fill="url(#logoGrad)"
      />
      <path
        d="M32 85V25L52 13V85H32Z"
        fill="url(#logoGrad)"
        opacity="0.7"
      />
      {/* C */}
      <path
        d="M108 50c0-22-18-38-38-38S32 28 32 50s18 38 38 38c12 0 22-5 30-14l-14-12c-4 5-10 8-16 8-12 0-22-10-22-22s10-22 22-22c6 0 12 3 16 8l14-12c-8-9-18-14-30-14-22 0-40 16-40 38s18 38 40 38c14 0 26-7 34-18l-14-10c-5 8-14 13-24 13z"
        fill="url(#logoGrad)"
      />
      {/* K */}
      <path
        d="M115 85V15h20v28l22-28h24l-28 34 28 36h-24l-22-28v28h-20z"
        fill="url(#logoGrad)"
      />
    </svg>
  );
}
