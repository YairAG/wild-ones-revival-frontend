/** Calidad gráfica de Ruffle: baja quita suavizado y ayuda en equipos lentos */
export type Quality = "low" | "medium" | "high";

/** Preferencias de este navegador (no de la cuenta): se guardan en localStorage */
export type Preferences = {
  quality: Quality;
  volume: number; // 0 a 100
  muteInBackground: boolean; // si cambias de pestaña, el juego se calla
  showChatTime: boolean; // hora en los mensajes del chat
};

export type SettingsTab = "game" | "audio" | "chat" | "account";
