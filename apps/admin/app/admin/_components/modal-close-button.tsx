"use client";

type ModalCloseButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};

export function ModalCloseButton({ disabled, onClick }: ModalCloseButtonProps) {
  return (
    <button
      aria-label="关闭"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xl leading-none text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      ×
    </button>
  );
}
