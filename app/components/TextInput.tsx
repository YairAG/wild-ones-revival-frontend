import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

export function TextInput({ label, hint, ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="etiqueta">{label}</span>
      <input {...props} className="campo" />
      {hint && <span className="ayuda">{hint}</span>}
    </label>
  );
}
