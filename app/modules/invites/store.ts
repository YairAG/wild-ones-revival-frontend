// Invitaciones a partida: la que te llegó y un aviso corto para quien invita.
import { create } from "zustand";
import { useAuthStore } from "@/modules/auth/store";
import type { PlayerRef } from "@/modules/friends/types";
import { openSocialConnection } from "./services/social-connection";
import type { SocialServerMessage } from "./types";

const NOTICE_MS = 5_000;

type InvitesState = {
  incoming: PlayerRef | null; // quien te invitó (pendiente de responder)
  notice: string | null; // "Invitación enviada a Beto", errores...
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

  function handle(message: SocialServerMessage) {
    switch (message.command) {
      case "invite":
        return set({ incoming: message.from });
      case "invite_sent":
        return notify(`Invitación enviada a ${message.to.dname}`);
      case "invite_accepted":
        return notify(`${message.by.dname} aceptó: entrando a la sala`);
      case "invite_declined":
        return notify(`${message.by.dname} no puede jugar ahora`);
      case "invite_error":
        return notify(message.error);
    }
  }

  return {
    incoming: null,
    notice: null,

    connect() {
      const token = useAuthStore.getState().session?.token ?? "";
      connection = openSocialConnection(token, handle);
      return () => {
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
