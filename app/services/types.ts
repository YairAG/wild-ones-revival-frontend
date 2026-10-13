// Formato de las respuestas del backend de cuentas, del chat y de la conexión social (el mismo en los tres):
//   bien:  { ok: true,  code: 200, message: "Solicitud enviada", data: {...} }
//   error: { ok: false, code: 409, message: "Ese nombre ya existe", error: "NAME_TAKEN" }
// `message` se muestra al jugador; `error` es un id fijo para decidir qué hacer (p. ej. SESSION_EXPIRED).

export type Success<T = undefined> = { ok: true; code: number; message: string; data?: T };
export type Failure = { ok: false; code: number; message: string; error: string };
export type ApiResponse<T> = Success<T> | Failure;

/** Estado de una conexión que se reintenta sola (ver reconnect.ts) */
export type ReconnectState = {
  lost: boolean; // se cayó y todavía no vuelve
  attempt: number; // intentos hechos desde que se cayó
  secondsLeft: number; // para el siguiente intento; 0 = intentando ahora
  failed: boolean; // se acabaron los intentos: hay que reintentar a mano
};
