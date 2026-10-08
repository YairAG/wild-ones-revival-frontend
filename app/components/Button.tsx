import type { ButtonHTMLAttributes } from "react";

/** La acción principal (naranja). Solo una por vista */
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="font-title h-12 w-full rounded-md border-2 border-action-edge bg-action text-xl tracking-wide text-on-action shadow-[0_4px_0_var(--color-action-edge)] active:translate-y-1 active:shadow-none disabled:opacity-60"
    />
  );
}
