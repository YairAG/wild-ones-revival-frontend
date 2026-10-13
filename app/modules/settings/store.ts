// Ajustes (modal): las preferencias de este navegador (calidad, volumen, chat), que se guardan en localStorage y
// se aplican al momento, y las acciones de la cuenta (contraseña, sesiones, eliminar).
import { create } from "zustand";
import { useAuthStore } from "@/modules/auth/store";
import { accountApi } from "./services/account-api";
import type { DmPolicy, Preferences, SettingsTab } from "./types";

const PREFERENCES_KEY = "wildrevival-settings";
const DEFAULTS: Preferences = {
  quality: "high",
  volume: 100,
  muteInBackground: true,
  showChatTime: true,
  highlightMentions: true,
};

function savedPreferences(): Preferences {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{}") };
  } catch {
    return DEFAULTS; // sin localStorage o con algo ilegible: los valores por defecto
  }
}

type SettingsState = {
  open: boolean;
  tab: SettingsTab;
  preferences: Preferences;
  notice: { ok: boolean; text: string } | null; // respuesta de una acción de la cuenta
  dmPolicy: DmPolicy | null; // de la cuenta; null: sin cargar
  loadAccount(): Promise<void>;
  setDmPolicy(dmPolicy: DmPolicy): Promise<void>;
  show(): void;
  hide(): void;
  setTab(tab: SettingsTab): void;
  setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]): void;
  changePassword(current: string, next: string): Promise<boolean>; // true si se cambió
  logoutOthers(): Promise<void>;
  deleteAccount(password: string): Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => {
  // Hace una acción de la cuenta y muestra lo que respondió el backend
  async function run(action: () => Promise<{ message: string }>): Promise<boolean> {
    try {
      set({ notice: { ok: true, text: (await action()).message } });
      return true;
    } catch (e) {
      set({ notice: { ok: false, text: (e as Error).message } });
      return false;
    }
  }

  return {
    open: false,
    tab: "game",
    preferences: savedPreferences(),
    notice: null,
    dmPolicy: null,

    async loadAccount() {
      try {
        set({ dmPolicy: (await accountApi.get()).dmPolicy });
      } catch (e) {
        set({ notice: { ok: false, text: (e as Error).message } });
      }
    },
    async setDmPolicy(dmPolicy) {
      const before = get().dmPolicy;
      set({ dmPolicy }); // se ve al momento; si falla, vuelve
      if (!(await run(() => accountApi.setDmPolicy(dmPolicy)))) set({ dmPolicy: before });
    },

    show() {
      set({ open: true, notice: null });
      void get().loadAccount();
    },
    hide: () => set({ open: false }),
    setTab: (tab) => set({ tab, notice: null }),

    setPreference(key, value) {
      const preferences = { ...get().preferences, [key]: value };
      set({ preferences });
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      } catch {
        // no se pudo guardar: igual se aplica en esta visita
      }
    },

    changePassword: (current, next) => run(() => accountApi.changePassword(current, next)),
    logoutOthers: async () => void (await run(accountApi.logoutOthers)),

    async deleteAccount(password) {
      if (!(await run(() => accountApi.remove(password)))) return;
      // La cuenta ya no existe (y la cookie se borró): sin sesión, la pantalla del juego manda al login
      set({ open: false });
      useAuthStore.setState({ session: null, mode: "login", error: null });
    },
  };
});
