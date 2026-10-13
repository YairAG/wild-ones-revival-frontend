// Llamadas al backend de cuentas para leer los privados (se mandan por el WebSocket del chat).
import type { PlayerRef } from "@/modules/friends/types";
import { accountsRequest as request } from "@/services/accounts-request";
import type { Conversation, DirectMessage } from "../types";

export const dmsApi = {
  conversations: async () => (await request<Conversation[]>("GET", "/dms")).data!,
  // Los últimos mensajes con ese jugador (y los marca como leídos)
  thread: async (id: number) =>
    (await request<{ with: PlayerRef; messages: DirectMessage[] }>("GET", `/dms/${id}`)).data!,
  markRead: (id: number) => request("POST", `/dms/${id}/read`),
};
