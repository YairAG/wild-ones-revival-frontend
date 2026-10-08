import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
    />
  );
}
