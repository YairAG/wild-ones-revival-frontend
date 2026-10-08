import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function TextInput({ label, ...props }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-stone-300">{label}</span>
      <input
        {...props}
        className="w-full rounded border border-stone-600 bg-stone-800 px-3 py-2 text-white"
      />
    </label>
  );
}
