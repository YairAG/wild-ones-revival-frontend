// Estado de la sesión: quién entró y su token, y si la pantalla muestra "entrar" o "crear cuenta".
import { create } from "zustand";
import { accountsApi } from "./services/accounts-api";
import type { AuthMode, Session } from "./types";

type AuthState = {
  session: Session | null;
  mode: AuthMode;
  loading: boolean;
  error: string | null;
  toggleMode(): void;
  submit(dname: string, password: string): Promise<boolean>;
  logout(): void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  mode: "login",
  loading: false,
  error: null,

  toggleMode: () => set({ mode: get().mode === "login" ? "register" : "login", error: null }),

  // Registra o entra según el modo. Devuelve true si salió bien
  async submit(dname, password) {
    set({ loading: true, error: null });
    try {
      const session = await accountsApi[get().mode](dname, password);
      set({ session, loading: false });
      return true;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      return false;
    }
  },

  // Al salir, el formulario vuelve a "entrar"
  logout: () => set({ session: null, mode: "login", error: null }),
}));
