// Petición al backend de cuentas. Con sesión, va con un token de acceso vigente (si venció, primero se renueva).
// Siempre con credentials: "include" para que el navegador mande y guarde la cookie de sesión (httpOnly).
// Devuelve la respuesta completa ({ ok, code, message, data }); si falla, lanza ApiError.
import { useAuthStore } from "@/modules/auth/store";
import type { ApiResponse, Success } from "./types";

const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL;

/** Error del backend: `message` para mostrar, `error` (id fijo) y `code` para decidir qué hacer */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly error: string,
    public readonly code: number,
  ) {
    super(message);
  }
}

// auth: false para las rutas que dan la sesión (login, registro, refresh, logout): no llevan token
export async function accountsRequest<T = undefined>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: object,
  { auth = true } = {},
): Promise<Success<T>> {
  const token = auth ? await useAuthStore.getState().freshToken() : null;
  let res: ApiResponse<T>;
  try {
    const response = await fetch(ACCOUNTS_URL + path, {
      method,
      credentials: "include",
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    res = await response.json();
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", "NETWORK_ERROR", 0);
  }
  if (!res.ok) {
    // Con un token recién renovado, esto es que la sesión ya no existe: GameScreen manda al login
    if (auth && res.error === "SESSION_EXPIRED") useAuthStore.getState().expire();
    throw new ApiError(res.message, res.error, res.code);
  }
  return res;
}
