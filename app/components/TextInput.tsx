import type { InputHTMLAttributes, ReactNode } from "react";

// tone: el aviso de abajo en verde ("ok") o en rojo ("error"), con el borde del campo a juego. children va
// entre el campo y el aviso (p. ej. el medidor de contraseña)
type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  tone?: "ok" | "error";
  children?: ReactNode;
};

const HINT_CLASS = { ok: "ayuda-exito", error: "ayuda-error" };

export function TextInput({ label, hint, tone, children, ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="etiqueta">{label}</span>
      <input
        {...props}
        aria-invalid={tone === "error" || undefined}
        className={tone === "ok" ? "campo campo-valido" : "campo"}
      />
      {children}
      {hint && (
        <span className={tone ? HINT_CLASS[tone] : "ayuda"} aria-live="polite">
          {hint}
        </span>
      )}
    </label>
  );
}
