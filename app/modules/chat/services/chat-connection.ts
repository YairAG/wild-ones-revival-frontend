// Conexión al chat global: WebSocket /chat del backend de cuentas. Cada mensaje es un JSON; el primero lleva
// el token del login.
import type { ChatServerEvent } from "../types";

// La misma dirección que el backend de cuentas, con ws:// en vez de http:// (o wss:// en vez de https://)
const CHAT_URL = import.meta.env.VITE_ACCOUNTS_URL.replace(/^http/, "ws") + "/chat";

/** Abre la conexión y entra con el token. Devuelve cómo enviar mensajes y cómo cerrarla */
export function openChatConnection(
  token: string,
  onEvent: (event: ChatServerEvent) => void,
  onClose: () => void,
) {
  const ws = new WebSocket(CHAT_URL);
  ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token }));
  ws.onmessage = (event) => onEvent(JSON.parse(String(event.data)));
  ws.onclose = onClose;

  return {
    send(message: object) {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
    },
    close() {
      ws.onclose = null; // cerrarla a propósito no es una desconexión
      ws.close();
    },
  };
}
