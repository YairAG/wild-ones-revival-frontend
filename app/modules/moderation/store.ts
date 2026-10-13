// Panel de moderación: si está abierto, quién está silenciado y el registro de acciones.
// Se carga al abrirlo y después de quitar un silencio.
import { create } from "zustand";
import { moderationApi } from "./services/moderation-api";
import type { ModerationSummary } from "./types";

type ModerationState = {
  open: boolean;
  summary: ModerationSummary | null; // null: cargando
  error: string | null;
  show(): void;
  hide(): void;
  load(): Promise<void>;
  unmute(id: number): Promise<void>;
};

export const useModerationStore = create<ModerationState>((set, get) => ({
  open: false,
  summary: null,
  error: null,

  show() {
    set({ open: true, summary: null, error: null });
    void get().load();
  },
  hide: () => set({ open: false }),

  async load() {
    try {
      set({ summary: await moderationApi.summary(), error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async unmute(id) {
    try {
      await moderationApi.unmute(id);
      await get().load();
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
