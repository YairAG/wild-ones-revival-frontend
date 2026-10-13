/** Calidad gráfica de Ruffle: baja quita suavizado y ayuda en equipos lentos */
export type Quality = "low" | "medium" | "high";

/** Preferencias de este navegador (no de la cuenta): se guardan en localStorage */
export type Preferences = {
  quality: Quality;
  volume: number; // 0 a 100
  muteInBackground: boolean; // si cambias de pestaña, el juego se calla
  showChatTime: boolean; // hora en los mensajes del chat
  highlightMentions: boolean; // resaltar los mensajes del global que te mencionan (@tu_nombre)
};

/** Quién puede escribirte en privado (ajuste de la cuenta, lo respeta el servidor) */
export type DmPolicy = "friends" | "everyone" | "nobody";

export type SettingsTab = "game" | "audio" | "chat" | "account";
