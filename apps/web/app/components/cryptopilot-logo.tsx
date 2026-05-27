type CryptoPilotLogoProps = {
  showText?: boolean;
  className?: string;
  markClassName?: string;
};

export function CryptoPilotLogo({
  showText = true,
  className = "",
  markClassName = "h-9 w-9"
}: CryptoPilotLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark className={markClassName} />
      {showText ? (
        <div className="leading-tight">
          <p className="text-base font-semibold text-[#111111]">CryptoPilot</p>
          <p className="text-xs text-[#6B7280]">AI Market Intelligence</p>
        </div>
      ) : null}
    </div>
  );
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 64 64" fill="none">
      <path
        d="M30 10C18 10 10 18 10 30C10 42 18 50 30 50"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path d="M30 30L48 23L41 41Z" fill="currentColor" />
    </svg>
  );
}
