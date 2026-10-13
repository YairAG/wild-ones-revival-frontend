// Ayudas del formulario de registro mientras escribes: si el nombre está libre (se le pregunta al backend un
// poco después de la última tecla), qué tan buena es la contraseña y si la confirmación coincide.
import { create } from "zustand";
import { passwordStrength } from "./helpers/password-strength";
import { accountsApi } from "./services/accounts-api";
import type { NameCheck } from "./types";

// Espera tras la última tecla antes de preguntar al backend
export const NAME_CHECK_DELAY_MS = 400;
const HINT = "Entre 3 y 16 caracteres: letras, números y guion bajo.";

type RegisterState = {
  name: NameCheck;
  strength: { score: number; label: string };
  checkName(dname: string): void;
  setPassword(password: string): void;
  confirm: "idle" | "match" | "mismatch"; // idle: la confirmación está vacía
  checkConfirm(password: string, confirm: string): void;
  reset(): void;
};

let timer: ReturnType<typeof setTimeout> | undefined;
let lastName = ""; // la respuesta de un nombre que ya cambió se ignora

export const useRegisterStore = create<RegisterState>()((set) => ({
  name: { status: "idle", message: HINT },
  strength: passwordStrength(""),

  checkName(dname) {
    clearTimeout(timer);
    lastName = dname;
    // Lo que se ve sin preguntar: mismas reglas que el backend
    if (/[^A-Za-z0-9_]/.test(dname))
      return set({ name: { status: "invalid", message: "Solo letras, números y guion bajo." } });
    if (dname.length > 16)
      return set({ name: { status: "invalid", message: "Máximo 16 caracteres." } });
    if (dname.length < 3) return set({ name: { status: "idle", message: HINT } });

    set({ name: { status: "checking", message: "Revisando..." } });
    timer = setTimeout(async () => {
      let available: boolean;
      try {
        available = await accountsApi.nameAvailable(dname);
      } catch {
        // Sin respuesta no se sabe: el registro lo dirá al enviar
        if (lastName === dname) set({ name: { status: "idle", message: HINT } });
        return;
      }
      if (lastName !== dname) return;
      set({
        name: available
          ? { status: "available", message: "Disponible." }
          : { status: "taken", message: "Ese nombre ya está ocupado." },
      });
    }, NAME_CHECK_DELAY_MS);
  },

  setPassword: (password) => set({ strength: passwordStrength(password) }),

  confirm: "idle",
  checkConfirm: (password, confirm) =>
    set({ confirm: !confirm ? "idle" : confirm === password ? "match" : "mismatch" }),

  reset() {
    clearTimeout(timer);
    lastName = "";
    set({
      name: { status: "idle", message: HINT },
      strength: passwordStrength(""),
      confirm: "idle",
    });
  },
}));
