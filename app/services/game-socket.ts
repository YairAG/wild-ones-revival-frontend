// Conexión con el servidor de juego por WebSocket (protocolo en docs/PROTOCOL.md de Wild-Ones-Revival).
// Cada mensaje es: 6 dígitos con la longitud + JSON. Ej.: 000018{"command":"ping"}
import type { GameMessage, LobbyMessage, ServerMessage } from "wildones-protocol";

const GAME_URL = import.meta.env.VITE_GAME_URL;
// El servidor antepone esto a su primera respuesta (herencia del original)
const FIRST_RESPONSE_HEADER = "Originality is undetected plagiarism.\r\n\r\n";

export type GameSocket = {
  send(message: LobbyMessage | GameMessage): void;
  close(): void;
};

/** Empaqueta un mensaje: longitud en 6 dígitos + JSON */
export function encode(message: object): string {
  const json = JSON.stringify(message);
  return String(json.length).padStart(6, "0") + json;
}

/** Devuelve una función que recibe texto y entrega los mensajes completos (un mensaje puede llegar partido) */
export function createDecoder(): (chunk: string) => ServerMessage[] {
  let buffer = "";
  return (chunk) => {
    buffer += chunk;
    if (buffer.startsWith(FIRST_RESPONSE_HEADER))
      buffer = buffer.slice(FIRST_RESPONSE_HEADER.length);

    const messages: ServerMessage[] = [];
    while (buffer.length >= 6) {
      const length = Number(buffer.slice(0, 6));
      if (buffer.length < 6 + length) break; // falta el resto: esperar el próximo trozo
      messages.push(JSON.parse(buffer.slice(6, 6 + length)));
      buffer = buffer.slice(6 + length);
    }
    return messages;
  };
}

/**
 * Abre una conexión. path: "/ballistic/lobby?session=x" o "/ballistic/game?gameId=...&session=..."
 * onMessage recibe cada mensaje del servidor; onClose, cuando se corta la conexión.
 */
export function connectGameSocket(
  path: string,
  onMessage: (message: ServerMessage) => void,
  onClose: () => void,
): Promise<GameSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(GAME_URL);
    const decode = createDecoder();

    ws.onopen = () => {
      ws.send(`POST ${path} HTTP/1.1\r\n\r\n`); // el primer mensaje dice qué tipo de conexión es
      resolve({ send: (message) => ws.send(encode(message)), close: () => ws.close() });
    };
    ws.onmessage = (event) => decode(String(event.data)).forEach(onMessage);
    ws.onerror = () => reject(new Error("No se pudo conectar con el servidor de juego"));
    ws.onclose = onClose;
  });
}
