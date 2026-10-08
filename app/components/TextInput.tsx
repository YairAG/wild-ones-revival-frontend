import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

export function TextInput({ label, hint, ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      <input
        {...props}
        className="h-11 rounded border-2 border-line bg-field px-3 text-[15px] text-ink placeholder:text-disabled"
      />
      {hint && <span className="text-[13px] font-semibold text-muted">{hint}</span>}
    </label>
  );
}
