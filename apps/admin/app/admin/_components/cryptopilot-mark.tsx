type CryptoPilotMarkProps = {
  className?: string;
  showText?: boolean;
};

export function CryptoPilotMark({ className = "h-9 w-9", showText = false }: CryptoPilotMarkProps) {
  const mark = (
    <svg aria-hidden className={className} viewBox="0 0 64 64" fill="none">
      <path d="M30 10C18 10 10 18 10 30C10 42 18 50 30 50" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
      <path d="M30 30L48 23L41 41Z" fill="currentColor" />
    </svg>
  );

  if (!showText) return mark;

  return (
    <div className="flex items-center gap-3 text-slate-950">
      {mark}
      <div className="leading-tight">
        <p className="text-sm font-semibold">CryptoPilot</p>
        <p className="text-xs text-slate-500">管理后台</p>
      </div>
    </div>
  );
}
