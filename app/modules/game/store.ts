// Estado del juego: el reproductor de Ruffle montado en la página.
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
  restart(): void; // lo vuelve a cargar en el mismo lugar (tras una caída del servidor)
};

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
}));
