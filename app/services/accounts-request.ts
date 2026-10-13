// Petición al backend de cuentas con el token de la sesión (el mismo del login). La usan amigos y moderación.
import { useAuthStore } from "@/modules/auth/store";

const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL;

export async function accountsRequest<T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: object,
) {
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
