// Formulario de login / registro. Lee los campos al enviar; al registrarse, además, avisa mientras escribes si
// el nombre está libre, qué tan buena es la contraseña y si la confirmación coincide (useRegisterStore).
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TextInput } from "@/components/TextInput";
import { useRegisterStore } from "../register-store";
import { useAuthStore } from "../store";

const NAME_TONE = { available: "ok", taken: "error", invalid: "error" } as const;
const CONFIRM_TONE = { match: "ok", mismatch: "error" } as const;

// Color de las barras llenas según cuántas son (1: rojo, 2: naranja, 3-4: verde)
const barColor = (score: number) =>
  score <= 1 ? "bg-error" : score === 2 ? "bg-naranja" : "bg-exito";

export function AuthForm({ onSuccess }: { onSuccess(): void }) {
  const { mode, submit, loading, error } = useAuthStore();
  const { name, strength, confirm, checkName, setPassword, checkConfirm, reset } =
    useRegisterStore();
  const isLogin = mode === "login";

  // Al cambiar cualquiera de las dos contraseñas se vuelve a comparar
  function comparePasswords(e: ChangeEvent<HTMLInputElement>) {
    const form = new FormData(e.currentTarget.form!);
    checkConfirm(String(form.get("password")), String(form.get("confirm")));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLogin && confirm === "mismatch") return; // el aviso ya está en rojo bajo el campo
    const form = new FormData(e.currentTarget);
    const signup = isLogin
      ? undefined
      : { email: String(form.get("email")), acceptTerms: form.get("acceptTerms") === "on" };
    if (await submit(String(form.get("dname")), String(form.get("password")), signup)) {
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
      {!isLogin && (
        <TextInput
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          required
          hint="Solo para recuperar tu cuenta. No enviamos publicidad."
        />
      )}
      <TextInput
        label="Contraseña"
        name="password"
        type="password"
        autoComplete={isLogin ? "current-password" : "new-password"}
        required
        onChange={
          isLogin
            ? undefined
            : (e) => {
                setPassword(e.target.value);
                comparePasswords(e);
              }
        }
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
      {!isLogin && (
        <>
          <TextInput
            label="Confirmar contraseña"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            onChange={comparePasswords}
            hint={
              confirm === "mismatch"
                ? "Las contraseñas no coinciden."
                : confirm === "match"
                  ? "Coinciden."
                  : undefined
            }
            tone={confirm === "idle" ? undefined : CONFIRM_TONE[confirm]}
          />
          <label className="flex items-start gap-2.5 text-sm leading-snug text-texto-cuerpo">
            <input
              type="checkbox"
              name="acceptTerms"
              required
              className="mt-0.5 size-4.5 shrink-0 accent-naranja"
            />
            {/* En otra pestaña: así no se pierde lo que ya escribió */}
            <span>
              Acepto las{" "}
              <a href="/reglas" target="_blank" className="font-extrabold">
                reglas de la comunidad
              </a>
              , el{" "}
              <a href="/privacidad" target="_blank" className="font-extrabold">
                aviso de privacidad
              </a>{" "}
              y los{" "}
              <a href="/terminos" target="_blank" className="font-extrabold">
                términos de uso
              </a>
              .
            </span>
          </label>
        </>
      )}
      <ErrorMessage message={error} />
      <div className="mt-1">
        <Button type="submit" disabled={loading}>
          {isLogin ? "Jugar" : "Crear y jugar"}
        </Button>
      </div>
    </form>
  );
}
