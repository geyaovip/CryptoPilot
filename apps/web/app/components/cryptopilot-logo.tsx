import Image from "next/image";

const IN_APP_LOGO = "/brand/in-app-logo.png";
const APP_ICON = "/brand/app-icon.png";

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
  if (showText) {
    return (
      <Image
        alt="CryptoPilot"
        className={`h-9 w-auto ${className}`.trim()}
        height={290}
        priority
        src={IN_APP_LOGO}
        width={770}
      />
    );
  }

  return <LogoMark className={markClassName} />;
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <Image
      alt=""
      aria-hidden
      className={`aspect-square w-auto ${className}`.trim()}
      height={410}
      src={APP_ICON}
      width={410}
    />
  );
}
