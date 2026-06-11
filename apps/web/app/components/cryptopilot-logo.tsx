import { BrandMarkIcon } from "@cryptopilot/ui";

type CryptoPilotLogoProps = {
  showText?: boolean;
  className?: string;
  markClassName?: string;
};

export function CryptoPilotLogo({
  showText = true,
  className = "",
  markClassName = "h-10 w-10 text-[#111111]"
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

export function LogoMark({ className = "h-10 w-10 text-[#111111]" }: { className?: string }) {
  return <BrandMarkIcon className={className} />;
}
