// Mensajes del chat (WebSocket /chat del backend de cuentas, ver README de wildones-accounts): el global y los
// privados.
import type { PlayerRef } from "@/modules/friends/types";
import type { Failure, Success } from "@/services/types";

/** Un mensaje del chat global */
export type ChatMessage = {
  id: string;
  userId: number; // quién lo escribió
  dname: string;
  text: string;
  original?: string; // solo llega a moderadores, si el filtro cambió el texto
  at: string; // fecha ISO
};

/** Un mensaje privado */
export type DirectMessage = {
  id: string;
  from: PlayerRef;
  to: PlayerRef;
  text: string;
  at: string; // fecha ISO
};

/** Una conversación en la lista de privados (GET /dms) */
export type Conversation = {
  with: PlayerRef;
  last: { text: string; at: string; fromMe: boolean };
  unread: number;
};

/** Qué pestaña del panel se ve */
export type ChatView = "global" | "dms";

/** Lo que manda el servidor */
export type ChatServerEvent =
  | { type: "history"; messages: ChatMessage[]; mod: boolean } // al entrar
  | { type: "message"; message: ChatMessage }
  | { type: "deleted"; id: string } // un moderador lo borró
  | { type: "dm"; message: DirectMessage } // privado nuevo (tuyo o para ti)
  | ({ type: "notice" } & Success) // aviso solo para ti, con el formato de todas las respuestas
  | ({ type: "error" } & Failure);
