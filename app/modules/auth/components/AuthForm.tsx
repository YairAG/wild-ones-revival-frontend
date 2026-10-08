// Formulario de login / registro. Lee los campos al enviar (sin estado por cada tecla).
import type { FormEvent } from "react";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TextInput } from "@/components/TextInput";
import { useAuthStore } from "../store";

export function AuthForm({ onSuccess }: { onSuccess(): void }) {
  const { mode, submit, loading, error } = useAuthStore();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (await submit(String(form.get("dname")), String(form.get("password")))) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput label="Nombre" name="dname" autoComplete="username" required />
      <TextInput
        label="Contraseña"
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        required
      />
      <ErrorMessage message={error} />
      <Button type="submit" disabled={loading}>
        {mode === "login" ? "Entrar" : "Crear cuenta"}
      </Button>
    </form>
  );
}
