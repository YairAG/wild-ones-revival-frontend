// Panel de moderación: si está abierto, los reportes sin resolver, quién está silenciado y el registro de
// acciones. Se carga al abrirlo y después de cada acción.
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
  resolve(reportId: string): Promise<void>;
};

export const useModerationStore = create<ModerationState>((set, get) => {
  // Hace la acción y recarga; si falla, muestra el error
  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await get().load();
    } catch (e) {
      set({ error: (e as Error).message });
    }
  }

  return {
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

    unmute: (id) => run(() => moderationApi.unmute(id)),
    resolve: (reportId) => run(() => moderationApi.resolve(reportId)),
  };
});
