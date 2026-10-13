// Petición al backend de cuentas. Si hay sesión, va con su token (el mismo del login). La usan auth, amigos y
// moderación. Devuelve la respuesta completa ({ ok, code, message, data }); si falla, lanza ApiError.
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

export async function accountsRequest<T = undefined>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: object,
): Promise<Success<T>> {
  const token = useAuthStore.getState().session?.token;
  let res: ApiResponse<T>;
  try {
    const response = await fetch(ACCOUNTS_URL + path, {
      method,
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
  if (!res.ok) throw new ApiError(res.message, res.error, res.code);
  return res;
}
