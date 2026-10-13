// Estado del juego: el reproductor de Ruffle montado en la página, el modo enfoque y la pantalla completa.
import { create } from "zustand";
import { useAuthStore } from "@/modules/auth/store";
import { startGame } from "./services/ruffle";
import type { RufflePlayerElement } from "./types";

type GameState = {
  player: RufflePlayerElement | null;
  loading: boolean;
  error: string | null;
  mount(container: HTMLElement, dname: string): Promise<void>;
  unmount(): void;
  restart(): void; // lo vuelve a cargar en el mismo lugar (tras una caída o con "Recargar")
  focus: boolean; // modo enfoque: sin paneles, el juego más grande
  toggleFocus(): void;
  fullscreen(): void; // el recuadro del juego a pantalla completa
};

// El modo enfoque es una preferencia de este navegador (no de la cuenta): se recuerda en localStorage
const FOCUS_KEY = "wildrevival-focus";
function savedFocus(): boolean {
  try {
    return localStorage.getItem(FOCUS_KEY) === "1";
  } catch {
    return false; // sin acceso a localStorage: empieza sin enfoque
  }
}

// Con qué se montó la última vez, para restart()
let lastMount: { container: HTMLElement; dname: string } | null = null;

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  loading: false,
  error: null,

  async mount(container, dname) {
    if (get().player || get().loading) return; // uno solo, aunque React lo pida dos veces
    lastMount = { container, dname };
    set({ loading: true, error: null });
    try {
      // El SWF entra al servidor de juego con el token: tiene que estar vigente
      const token = await useAuthStore.getState().freshToken();
      if (token) set({ player: await startGame(container, dname, token) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  unmount() {
    get().player?.remove();
    set({ player: null });
  },

  restart() {
    if (!lastMount) return;
    get().unmount();
    void get().mount(lastMount.container, lastMount.dname);
  },

  focus: savedFocus(),
  toggleFocus() {
    const focus = !get().focus;
    set({ focus });
    try {
      localStorage.setItem(FOCUS_KEY, focus ? "1" : "0");
    } catch {
      // no se pudo guardar: igual cambia en esta visita
    }
  },

  // El recuadro (no solo el reproductor) para que el aviso de conexión perdida también se vea
  // (el navegador puede negarlo, p. ej. dentro de un iframe: entonces no pasa nada)
  fullscreen: () => void lastMount?.container.parentElement?.requestFullscreen().catch(() => {}),
}));
