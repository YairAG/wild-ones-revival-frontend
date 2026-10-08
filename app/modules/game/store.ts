// Estado del juego: el reproductor de Ruffle montado en la página.
import { create } from "zustand";
import { startGame } from "./services/ruffle";
import type { RufflePlayerElement } from "./types";

type GameState = {
  player: RufflePlayerElement | null;
  loading: boolean;
  error: string | null;
  mount(container: HTMLElement, dname: string, token: string): Promise<void>;
  unmount(): void;
};

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  loading: false,
  error: null,

  async mount(container, dname, token) {
    if (get().player || get().loading) return; // uno solo, aunque React lo pida dos veces
    set({ loading: true, error: null });
    try {
      set({ player: await startGame(container, dname, token) });
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
}));
