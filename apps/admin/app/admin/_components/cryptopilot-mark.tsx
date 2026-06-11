import { BrandMarkIcon } from "@cryptopilot/ui";

type CryptoPilotMarkProps = {
  className?: string;
  showText?: boolean;
};

export function CryptoPilotMark({ className = "h-10 w-10 text-[#111111]", showText = false }: CryptoPilotMarkProps) {
  const mark = <BrandMarkIcon className={className} />;

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
