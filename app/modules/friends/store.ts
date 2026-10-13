// Estado de amigos: la lista que da el backend y las acciones sobre solicitudes.
// Cada acción recarga la lista; además se recarga sola cada 15 s mientras el panel está en pantalla.
import { create } from "zustand";
import { friendsApi } from "./services/friends-api";
import type { FriendsList } from "./types";

const REFRESH_MS = 15_000;

type FriendsState = {
  list: FriendsList;
  error: string | null;
  load(): Promise<void>;
  send(dname: string): Promise<boolean>; // true si se envió
  accept(id: number): Promise<void>;
  dismiss(id: number): Promise<void>;
  startRefreshing(): () => void; // devuelve la función que la detiene
};

const empty: FriendsList = { friends: [], incoming: [], outgoing: [] };

export const useFriendsStore = create<FriendsState>((set, get) => {
  // Hace la acción y recarga; si falla, guarda el mensaje del backend para mostrarlo
  async function run(action: () => Promise<unknown>): Promise<boolean> {
    try {
      await action();
      set({ error: null });
      await get().load();
      return true;
    } catch (e) {
      set({ error: (e as Error).message });
      return false;
    }
  }

  return {
    list: empty,
    error: null,

    async load() {
      try {
        set({ list: await friendsApi.list() });
      } catch (e) {
        set({ error: (e as Error).message });
      }
    },

    send: (dname) => run(() => friendsApi.send(dname)),
    accept: async (id) => void (await run(() => friendsApi.accept(id))),
    dismiss: async (id) => void (await run(() => friendsApi.dismiss(id))),

    startRefreshing() {
      void get().load();
      const timer = setInterval(() => void get().load(), REFRESH_MS);
      return () => clearInterval(timer);
    },
  };
});
