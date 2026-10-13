// Estado de la sesión: quién entró y su token de acceso, y si la pantalla muestra "entrar" o "crear cuenta".
// Nada se guarda en el navegador: el token vive solo en memoria y la sesión se recupera al abrir la página con
// /refresh, que usa la cookie httpOnly que puso el backend (el JavaScript no la puede leer).
import { create } from "zustand";
import { isTokenExpired } from "./helpers/token";
import { accountsApi } from "./services/accounts-api";
import type { AuthMode, Session } from "./types";

// Se renueva un poco antes de que venza, para que no caduque en camino
const EXPIRY_MARGIN_MS = 30_000;

type AuthState = {
  session: Session | null;
  mode: AuthMode;
  loading: boolean;
  error: string | null;
  toggleMode(): void;
  submit(dname: string, password: string): Promise<boolean>;
  restore(): Promise<boolean>; // al abrir la página: true si había sesión (cookie vigente)
  freshToken(): Promise<string | null>; // token de acceso vigente (lo renueva si hace falta); null: sin sesión
  logout(): Promise<void>;
  expire(): void; // la sesión ya no sirve: sale y el login lo explica
};

// La versión anterior guardaba la sesión en localStorage: se borra la que haya quedado
try {
  localStorage.removeItem("wildones-session");
} catch {
  // sin acceso a localStorage: no hay nada que borrar
}

// Una sola renovación a la vez: si varias partes piden token al mismo tiempo, comparten la misma
let refreshing: Promise<Session | null> | null = null;

export const useAuthStore = create<AuthState>()((set, get) => {
  function refresh(): Promise<Session | null> {
    refreshing ??= accountsApi
      .refresh()
      .then((session) => {
        set({ session });
        return session;
      })
      .catch(() => null)
      .finally(() => (refreshing = null));
    return refreshing;
  }

  return {
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

    restore: async () => get().session !== null || (await refresh()) !== null,

    async freshToken() {
      const token = get().session?.token;
      if (token && !isTokenExpired(token, EXPIRY_MARGIN_MS)) return token;
      const session = await refresh();
      if (!session) get().expire();
      return session?.token ?? null;
    },

    // Primero se cierra en el backend (borra la cookie); si no, al volver al login se recuperaría la sesión.
    // Al salir, el formulario vuelve a "entrar"
    async logout() {
      await accountsApi.logout().catch(() => {}); // sin conexión: igual sale de la página
      set({ session: null, mode: "login", error: null });
    },
    expire: () => set({ session: null, mode: "login", error: "Tu sesión expiró, vuelve a entrar" }),
  };
});
