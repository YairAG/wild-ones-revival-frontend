// Conexión "social" al servidor de juego por WebSocket (la misma URL que usa el juego). Habla igual que el
// SWF: la primera vez "POST /ballistic/social", y cada mensaje es 6 dígitos de longitud + JSON. La longitud va
// en bytes (UTF-8), como la cuenta el SWF: con una ñ no es lo mismo que la cantidad de caracteres.
import type { SocialServerMessage } from "../types";

const GAME_URL = import.meta.env.VITE_GAME_URL;
const FIRST_RESPONSE_HEADER = "Originality is undetected plagiarism.\r\n\r\n"; // el servidor la manda una vez

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const frame = (message: object) => {
  const json = JSON.stringify(message);
  return String(encoder.encode(json).length).padStart(6, "0") + json;
};

/** Separa los mensajes que llegaron juntos en un texto */
export function readMessages(data: string): SocialServerMessage[] {
  let rest = encoder.encode(data.replace(FIRST_RESPONSE_HEADER, ""));
  const messages = [];
  while (rest.length >= 6) {
    const length = Number(decoder.decode(rest.subarray(0, 6)));
    messages.push(JSON.parse(decoder.decode(rest.subarray(6, 6 + length))));
    rest = rest.subarray(6 + length);
  }
  return messages;
}

/** Abre la conexión y entra con el token. onClose avisa si se cierra sola. Devuelve cómo enviar y cerrar */
export function openSocialConnection(
  token: string,
  onMessage: (message: SocialServerMessage) => void,
  onClose: () => void,
) {
  const ws = new WebSocket(GAME_URL);
  ws.onopen = () =>
    ws.send("POST /ballistic/social?x HTTP/1.1\r\n\r\n" + frame({ command: "logIn", token }));
  ws.onmessage = (event) => readMessages(String(event.data)).forEach(onMessage);
  ws.onclose = onClose;

  return {
    send(message: object) {
      if (ws.readyState === WebSocket.OPEN) ws.send(frame(message));
    },
    close() {
      ws.onclose = null; // cerrarla a propósito no es una desconexión
      ws.close();
    },
  };
}
