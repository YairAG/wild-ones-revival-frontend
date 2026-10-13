// Chat: el global y los privados, que llegan por la misma conexión; si puedes moderar y los avisos.
import { create } from "zustand";
import { useAuthStore } from "@/modules/auth/store";
import type { PlayerRef } from "@/modules/friends/types";
import { CONNECTED, createReconnector } from "@/services/reconnect";
import type { ReconnectState } from "@/services/types";
import { mentions } from "./mentions";
import { openChatConnection } from "./services/chat-connection";
import { dmsApi } from "./services/dms-api";
import type { ChatMessage, ChatServerEvent, ChatView, Conversation, DirectMessage } from "./types";

const NOTICE_MS = 5_000;

// Duraciones que se pueden elegir al silenciar, en minutos
export const MUTE_OPTIONS = [
  { minutes: 5, label: "5 min" },
  { minutes: 60, label: "1 hora" },
  { minutes: 24 * 60, label: "1 día" },
  { minutes: 7 * 24 * 60, label: "1 semana" },
];

type ChatState = {
  view: ChatView;
  setView(view: ChatView): void;
  messages: ChatMessage[]; // chat global
  mentioned: boolean; // te mencionaron en el global mientras veías los privados
  conversations: Conversation[];
  thread: PlayerRef | null; // la conversación privada abierta (null: la lista)
  threadMessages: DirectMessage[];
  openThread(player: PlayerRef): Promise<void>;
  closeThread(): void;
  mod: boolean; // puede borrar mensajes y silenciar
  connected: boolean;
  reconnect: ReconnectState; // si se cayó: cuenta regresiva para el siguiente intento
  reconnectNow(): void;
  notice: string | null; // errores del servidor ("Espera un momento...") y avisos
  connect(): () => void; // abre la conexión; devuelve la función que la cierra
  send(text: string): void; // al global, o a la conversación privada abierta
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

  async function loadConversations() {
    try {
      set({ conversations: await dmsApi.conversations() });
    } catch (e) {
      notify((e as Error).message);
    }
  }

  // Abre la conexión con un token vigente. Si se cierra sola (servidor caído, sin red), se reintenta.
  // `active`: si el panel ya se quitó mientras se renovaba el token, no se abre
  let active = false;
  async function open() {
    const token = await useAuthStore.getState().freshToken();
    if (!token || !active) return;
    connection = openChatConnection(token, handle, () => {
      set({ connected: false });
      reconnector.dropped();
    });
  }
  const reconnector = createReconnector(open, (reconnect) => set({ reconnect }));

  // Privado nuevo: si es de la conversación abierta se agrega (y se marca leído); la lista se recarga
  function receiveDm(dm: DirectMessage) {
    const me = useAuthStore.getState().session?.id;
    const other = dm.from.id === me ? dm.to : dm.from;
    const { thread, view } = get();
    if (view === "dms" && thread?.id === other.id) {
      set({ threadMessages: [...get().threadMessages, dm] });
      if (dm.from.id !== me) void dmsApi.markRead(other.id).catch(() => {});
    }
    void loadConversations();
  }

  function handle(event: ChatServerEvent) {
    switch (event.type) {
      case "history":
        reconnector.restored();
        void loadConversations();
        return set({ messages: event.messages, mod: event.mod, connected: true });
      case "message": {
        const me = useAuthStore.getState().session;
        const mentioned =
          get().view !== "global" &&
          event.message.userId !== me?.id &&
          mentions(event.message.text, me?.dname ?? "");
        return set({
          messages: [...get().messages, event.message],
          ...(mentioned && { mentioned }),
        });
      }
      case "deleted":
        return set({ messages: get().messages.filter((m) => m.id !== event.id) });
      case "dm":
        return receiveDm(event.message);
      case "error":
        if (event.error === "SESSION_EXPIRED") return useAuthStore.getState().expire();
        return notify(event.message);
      case "notice":
        return notify(event.message);
    }
  }

  return {
    view: "global",
    setView(view) {
      set({ view, ...(view === "global" && { mentioned: false }) });
      if (view === "dms") void loadConversations();
    },
    messages: [],
    mentioned: false,
    conversations: [],
    thread: null,
    threadMessages: [],

    async openThread(player) {
      set({ view: "dms", thread: player, threadMessages: [] });
      try {
        const { messages } = await dmsApi.thread(player.id); // también los marca como leídos
        if (get().thread?.id === player.id) set({ threadMessages: messages });
      } catch (e) {
        notify((e as Error).message);
      }
      void loadConversations();
    },
    closeThread: () => set({ thread: null, threadMessages: [] }),

    mod: false,
    connected: false,
    reconnect: CONNECTED,
    reconnectNow: () => reconnector.retryNow(),
    notice: null,

    connect() {
      active = true;
      void open();
      return () => {
        active = false;
        reconnector.stop();
        set({ reconnect: CONNECTED });
        connection?.close();
        connection = null;
        set({ connected: false });
      };
    },

    send(text) {
      const { view, thread } = get();
      if (view === "dms" && thread) connection?.send({ type: "dm", to: thread.id, text });
      else connection?.send({ type: "send", text });
    },
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
