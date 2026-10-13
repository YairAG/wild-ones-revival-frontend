// Lo que devuelve el backend de cuentas en GET /chat/moderation (ver README de wildones-accounts).
import type { PlayerRef } from "@/modules/friends/types";

/** Un jugador silenciado ahora */
export type MutedPlayer = PlayerRef & { until: string }; // fecha ISO en que termina

/** Una acción de un moderador */
export type ModerationLogEntry = {
  at: string; // fecha ISO
  mod: PlayerRef; // quién la hizo
  action: "delete" | "mute" | "unmute";
  target: PlayerRef;
  text?: string; // el mensaje borrado
  minutes?: number; // duración del silencio
  reason?: string; // motivo del silencio
};

export type ModerationSummary = {
  muted: MutedPlayer[]; // el que termina antes primero
  log: ModerationLogEntry[]; // la más nueva primero
};
