// Llamadas al backend de cuentas para amigos. Van con el token de la sesión (el mismo del login).
import { useAuthStore } from "@/modules/auth/store";
import type { FriendsList } from "../types";

const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL;

async function request<T>(method: "GET" | "POST" | "DELETE", path: string, body?: object) {
  const token = useAuthStore.getState().session?.token;
  const res = await fetch(ACCOUNTS_URL + path, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T; // sin contenido (rechazar, cancelar)
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error inesperado"); // el backend responde { error: "mensaje" }
  return data as T;
}

export const friendsApi = {
  list: () => request<FriendsList>("GET", "/friends"),
  send: (dname: string) => request("POST", "/friends/requests", { dname }),
  accept: (id: number) => request("POST", `/friends/requests/${id}/accept`),
  // Rechazar una que te enviaron o cancelar una que enviaste
  dismiss: (id: number) => request("DELETE", `/friends/requests/${id}`),
};
