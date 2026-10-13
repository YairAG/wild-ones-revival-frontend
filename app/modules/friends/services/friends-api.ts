// Llamadas al backend de cuentas para amigos. Van con el token de la sesión (el mismo del login).
import { accountsRequest as request } from "@/services/accounts-request";
import type { FriendsList } from "../types";

export const friendsApi = {
  list: () => request<FriendsList>("GET", "/friends"),
  send: (dname: string) => request("POST", "/friends/requests", { dname }),
  accept: (id: number) => request("POST", `/friends/requests/${id}/accept`),
  // Rechazar una que te enviaron o cancelar una que enviaste
  dismiss: (id: number) => request("DELETE", `/friends/requests/${id}`),
  // Dejar de ser amigos (para los dos)
  remove: (id: number) => request("DELETE", `/friends/${id}`),
};
