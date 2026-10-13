// Formulario de login / registro. Lee los campos al enviar; al registrarse, además, avisa mientras escribes si
// el nombre está libre y qué tan buena es la contraseña (useRegisterStore).
import type { FormEvent } from "react";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TextInput } from "@/components/TextInput";
import { useRegisterStore } from "../register-store";
import { useAuthStore } from "../store";

const NAME_TONE = { available: "ok", taken: "error", invalid: "error" } as const;

// Color de las barras llenas según cuántas son (1: rojo, 2: naranja, 3-4: verde)
const barColor = (score: number) =>
  score <= 1 ? "bg-error" : score === 2 ? "bg-naranja" : "bg-exito";

export function AuthForm({ onSuccess }: { onSuccess(): void }) {
  const { mode, submit, loading, error } = useAuthStore();
  const { name, strength, checkName, setPassword, reset } = useRegisterStore();
  const isLogin = mode === "login";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (await submit(String(form.get("dname")), String(form.get("password")))) {
      reset();
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextInput
        label="Usuario"
        name="dname"
        autoComplete="username"
        required
        onChange={isLogin ? undefined : (e) => checkName(e.target.value)}
        hint={isLogin ? undefined : name.message}
        tone={isLogin ? undefined : NAME_TONE[name.status as keyof typeof NAME_TONE]}
      />
      <TextInput
        label="Contraseña"
        name="password"
        type="password"
        autoComplete={isLogin ? "current-password" : "new-password"}
        required
        onChange={isLogin ? undefined : (e) => setPassword(e.target.value)}
        hint={isLogin ? undefined : strength.label}
      >
        {!isLogin && (
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-sm ${i < strength.score ? barColor(strength.score) : "bg-borde-suave"}`}
              />
            ))}
          </span>
        )}
      </TextInput>
      <ErrorMessage message={error} />
      <div className="mt-1">
        <Button type="submit" disabled={loading}>
          {isLogin ? "Jugar" : "Crear y jugar"}
        </Button>
      </div>
    </form>
  );
}
