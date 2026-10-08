// Formulario de login / registro. Lee los campos al enviar (sin estado por cada tecla).
import type { FormEvent } from "react";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TextInput } from "@/components/TextInput";
import { useAuthStore } from "../store";

export function AuthForm({ onSuccess }: { onSuccess(): void }) {
  const { mode, submit, loading, error } = useAuthStore();
  const isLogin = mode === "login";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (await submit(String(form.get("dname")), String(form.get("password")))) onSuccess();
  }

  // Al registrarse se muestran las reglas que valida el backend de cuentas
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextInput
        label="Usuario"
        name="dname"
        autoComplete="username"
        required
        hint={isLogin ? undefined : "Entre 3 y 16 caracteres: letras, números y guion bajo."}
      />
      <TextInput
        label="Contraseña"
        name="password"
        type="password"
        autoComplete={isLogin ? "current-password" : "new-password"}
        required
        hint={isLogin ? undefined : "Mínimo 8 caracteres."}
      />
      <ErrorMessage message={error} />
      <div className="mt-1">
        <Button type="submit" disabled={loading}>
          {isLogin ? "Jugar" : "Crear y jugar"}
        </Button>
      </div>
    </form>
  );
}
