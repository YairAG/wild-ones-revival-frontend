// Conexión "social" al servidor de juego por WebSocket (la misma URL que usa el juego). Habla igual que el
// SWF: la primera vez "POST /ballistic/social", y cada mensaje es 6 dígitos de longitud + JSON.
import type { SocialServerMessage } from "../types";

const GAME_URL = import.meta.env.VITE_GAME_URL;
const FIRST_RESPONSE_HEADER = "Originality is undetected plagiarism.\r\n\r\n"; // el servidor la manda una vez

const frame = (message: object) => {
  const json = JSON.stringify(message);
  return String(json.length).padStart(6, "0") + json;
};

/** Separa los mensajes que llegaron juntos en un texto */
export function readMessages(data: string): SocialServerMessage[] {
  let rest = data.replace(FIRST_RESPONSE_HEADER, "");
  const messages = [];
  while (rest.length >= 6) {
    const length = Number(rest.slice(0, 6));
    messages.push(JSON.parse(rest.slice(6, 6 + length)));
    rest = rest.slice(6 + length);
  }
  return messages;
}

/** Abre la conexión y entra con el token. Devuelve cómo enviar mensajes y cómo cerrarla */
export function openSocialConnection(
  token: string,
  onMessage: (message: SocialServerMessage) => void,
) {
  const ws = new WebSocket(GAME_URL);
  ws.onopen = () =>
    ws.send("POST /ballistic/social?x HTTP/1.1\r\n\r\n" + frame({ command: "logIn", token }));
  ws.onmessage = (event) => readMessages(String(event.data)).forEach(onMessage);

  return {
    send(message: object) {
      if (ws.readyState === WebSocket.OPEN) ws.send(frame(message));
    },
    close: () => ws.close(),
  };
}
