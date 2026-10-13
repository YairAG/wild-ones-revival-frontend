// Chat global: los mensajes que llegan por la conexión, si puedes moderar y los avisos.
import { create } from "zustand";
import { useAuthStore } from "@/modules/auth/store";
import type { PlayerRef } from "@/modules/friends/types";
import { openChatConnection } from "./services/chat-connection";
import type { ChatMessage, ChatServerEvent } from "./types";

const NOTICE_MS = 5_000;

// Duraciones que se pueden elegir al silenciar, en minutos
export const MUTE_OPTIONS = [
  { minutes: 5, label: "5 min" },
  { minutes: 60, label: "1 hora" },
  { minutes: 24 * 60, label: "1 día" },
  { minutes: 7 * 24 * 60, label: "1 semana" },
];

type ChatState = {
  messages: ChatMessage[];
  mod: boolean; // puede borrar mensajes y silenciar
  connected: boolean;
  notice: string | null; // errores del servidor ("Espera un momento...") y avisos
  connect(): () => void; // abre la conexión; devuelve la función que la cierra
  send(text: string): void;
  remove(id: string): void; // moderadores
  // Silenciar, en dos pasos: askMute abre el modal para elegir duración y motivo; mute lo manda
  muting: PlayerRef | null;
  askMute(player: PlayerRef | null): void; // null: cerrar el modal
  mute(minutes: number, reason: string): void;
};

let connection: ReturnType<typeof openChatConnection> | null = null;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;

export const useChatStore = create<ChatState>((set, get) => {
  // El aviso se quita solo a los 5 s
  function notify(text: string) {
    clearTimeout(noticeTimer);
    set({ notice: text });
    noticeTimer = setTimeout(() => set({ notice: null }), NOTICE_MS);
  }

  function handle(event: ChatServerEvent) {
    switch (event.type) {
      case "history":
        return set({ messages: event.messages, mod: event.mod, connected: true });
      case "message":
        return set({ messages: [...get().messages, event.message] });
      case "deleted":
        return set({ messages: get().messages.filter((m) => m.id !== event.id) });
      case "error":
        if (event.error === "SESSION_EXPIRED") return useAuthStore.getState().expire();
        return notify(event.message);
      case "notice":
        return notify(event.message);
    }
  }

  return {
    messages: [],
    mod: false,
    connected: false,
    notice: null,

    connect() {
      const token = useAuthStore.getState().session?.token ?? "";
      connection = openChatConnection(token, handle, () => set({ connected: false }));
      return () => {
        connection?.close();
        connection = null;
        set({ connected: false });
      };
    },

    send: (text) => connection?.send({ type: "send", text }),
    remove: (id) => connection?.send({ type: "delete", id }),

    muting: null,
    askMute: (player) => set({ muting: player }),
    mute(minutes, reason) {
      const player = get().muting;
      if (!player) return;
      connection?.send({ type: "mute", userId: player.id, minutes, reason });
      set({ muting: null });
    },
  };
});
