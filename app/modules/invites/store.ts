// Invitaciones a partida: la que te llegó y un aviso corto para quien invita.
import { create } from "zustand";
import { useAuthStore } from "@/modules/auth/store";
import type { PlayerRef } from "@/modules/friends/types";
import { useGameStore } from "@/modules/game/store";
import { CONNECTED, createReconnector } from "@/services/reconnect";
import type { ReconnectState } from "@/services/types";
import { openSocialConnection } from "./services/social-connection";
import type { SocialServerMessage } from "./types";

const NOTICE_MS = 5_000;

type InvitesState = {
  incoming: PlayerRef | null; // quien te invitó (pendiente de responder)
  notice: string | null; // "Invitación enviada a Beto", errores...
  // Si se cae esta conexión es que se cayó el servidor de juego: se reintenta y el juego muestra el aviso
  reconnect: ReconnectState;
  reconnectNow(): void;
  connect(): () => void; // abre la conexión; devuelve la función que la cierra
  invite(friendId: number): void;
  answer(accept: boolean): void;
};

let connection: ReturnType<typeof openSocialConnection> | null = null;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;

export const useInvitesStore = create<InvitesState>((set, get) => {
  // El aviso se quita solo a los 5 s
  function notify(text: string) {
    clearTimeout(noticeTimer);
    set({ notice: text });
    noticeTimer = setTimeout(() => set({ notice: null }), NOTICE_MS);
  }

  // Abre la conexión con un token vigente. `active`: si ya se cerró mientras se renovaba el token, no se abre
  let active = false;
  async function open() {
    const token = await useAuthStore.getState().freshToken();
    if (!token || !active) return;
    connection = openSocialConnection(token, handle, () => reconnector.dropped());
  }
  const reconnector = createReconnector(open, (reconnect) => set({ reconnect }));

  function handle(message: SocialServerMessage) {
    switch (message.command) {
      case "social_ready":
        // Volvió después de una caída: el SWF también perdió su conexión, así que se vuelve a cargar
        if (get().reconnect.lost) useGameStore.getState().restart();
        return reconnector.restored();
      case "invite":
        return set({ incoming: message.from });
      // El texto del aviso lo manda el servidor
      case "invite_sent":
      case "invite_accepted":
      case "invite_declined":
        return notify(message.message);
      case "error":
        if (message.error === "SESSION_EXPIRED") return useAuthStore.getState().expire();
        return notify(message.message);
    }
  }

  return {
    incoming: null,
    notice: null,

    reconnect: CONNECTED,
    reconnectNow: () => reconnector.retryNow(),

    connect() {
      active = true;
      void open();
      return () => {
        active = false;
        reconnector.stop();
        set({ reconnect: CONNECTED });
        connection?.close();
        connection = null;
      };
    },

    invite: (friendId) => connection?.send({ command: "invite", to: friendId }),

    answer(accept) {
      const from = get().incoming;
      if (!from) return;
      connection?.send({ command: "invite_answer", from: from.id, accept });
      set({ incoming: null });
    },
  };
});
