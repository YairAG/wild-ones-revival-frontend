// Ajustes (modal): por ahora solo si está abierto. Las opciones (juego, audio, chat, cuenta) vienen después.
import { create } from "zustand";

type SettingsState = {
  open: boolean;
  show(): void;
  hide(): void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
