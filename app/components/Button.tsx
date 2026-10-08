import type { ButtonHTMLAttributes } from "react";

/** La acción principal (naranja). Solo una por vista */
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="btn btn-jugar w-full" />;
}
