// Mensajes del chat global (WebSocket /chat del backend de cuentas, ver README de wildones-accounts).

/** Un mensaje del chat global */
export type ChatMessage = {
  id: string;
  userId: number; // quién lo escribió
  dname: string;
  text: string;
  original?: string; // solo llega a moderadores, si el filtro cambió el texto
  at: string; // fecha ISO
};

/** Lo que manda el servidor */
export type ChatServerEvent =
  | { type: "history"; messages: ChatMessage[]; mod: boolean } // al entrar
  | { type: "message"; message: ChatMessage }
  | { type: "deleted"; id: string } // un moderador lo borró
  | { type: "notice"; text: string }
  | { type: "error"; error: string };
