// Chat global: los mensajes que llegan por la conexión, si puedes moderar y los avisos.
import { create } from "zustand";
import { useAuthStore } from "@/modules/auth/store";
import { openChatConnection } from "./services/chat-connection";
import type { ChatMessage, ChatServerEvent } from "./types";

const NOTICE_MS = 5_000;
export const MUTE_MINUTES = 60;

type ChatState = {
  messages: ChatMessage[];
  mod: boolean; // puede borrar mensajes y silenciar
  connected: boolean;
  notice: string | null; // errores del servidor ("Espera un momento...") y avisos
  connect(): () => void; // abre la conexión; devuelve la función que la cierra
  send(text: string): void;
  remove(id: string): void; // moderadores
  mute(userId: number): void; // moderadores: silencia MUTE_MINUTES
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
      case "notice":
        return notify(event.text);
      case "error":
        return notify(event.error);
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
    mute: (userId) => connection?.send({ type: "mute", userId, minutes: MUTE_MINUTES }),
  };
});
