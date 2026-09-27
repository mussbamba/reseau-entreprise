export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-g)" />
      <circle cx="16" cy="14" r="6" fill="#fff" />
      <path d="M8 24c3-3 13-3 16 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M19 8c3-3 6-2 6-2s0 4-4 5" fill="#facc15" />
    </svg>
  );
}
