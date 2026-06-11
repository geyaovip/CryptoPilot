const APP_ICON = "/brand/app-icon.svg";

type CryptoPilotLogoProps = {
  showText?: boolean;
  className?: string;
  markClassName?: string;
};

export function CryptoPilotLogo({
  showText = true,
  className = "",
  markClassName = "h-9 w-9 text-[#111111]"
}: CryptoPilotLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <LogoMark className={markClassName} />
      {showText ? (
        <div className="leading-tight">
          <p className="text-base font-semibold text-[#111111]">CryptoPilot</p>
          <p className="text-xs text-[#6B7280]">AI 加密市场情报终端</p>
        </div>
      ) : null}
    </div>
  );
}

export function LogoMark({ className = "h-9 w-9 text-[#111111]" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      aria-hidden
      className={`block shrink-0 object-contain object-center ${className}`.trim()}
      src={APP_ICON}
    />
  );
}
