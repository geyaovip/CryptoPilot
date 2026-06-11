import Image from "next/image";

const IN_APP_LOGO = "/brand/in-app-logo.png";
const APP_ICON = "/brand/app-icon.png";

type CryptoPilotMarkProps = {
  className?: string;
  showText?: boolean;
};

export function CryptoPilotMark({ className = "h-9 w-9", showText = false }: CryptoPilotMarkProps) {
  if (showText) {
    const sizeClass = className === "h-9 w-9" ? "h-9" : className;
    return (
      <Image
        alt="CryptoPilot 管理后台"
        className={`w-auto max-w-full shrink-0 object-contain object-left ${sizeClass}`.trim()}
        height={290}
        priority
        src={IN_APP_LOGO}
        width={770}
      />
    );
  }

  return (
    <Image
      alt=""
      aria-hidden
      className={`h-9 w-9 shrink-0 object-contain ${className}`.trim()}
      height={410}
      src={APP_ICON}
      width={410}
    />
  );
}
