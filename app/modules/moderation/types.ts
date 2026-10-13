// Lo que devuelve el backend de cuentas en GET /chat/moderation (ver README de wildones-accounts).
import type { PlayerRef } from "@/modules/friends/types";
import type { ReportReason } from "@/modules/profile/types";

/** Un jugador silenciado ahora */
export type MutedPlayer = PlayerRef & { until: string }; // fecha ISO en que termina

/** Una acción de un moderador */
export type ModerationLogEntry = {
  at: string; // fecha ISO
  mod: PlayerRef; // quién la hizo
  action: "delete" | "mute" | "unmute" | "resolve_report";
  target: PlayerRef;
  text?: string; // el mensaje borrado
  minutes?: number; // duración del silencio
  reason?: string; // motivo del silencio
};

/** Un reporte sin resolver */
export type OpenReport = {
  id: string;
  from: PlayerRef; // quién reportó (solo lo ven los moderadores)
  target: PlayerRef;
  reason: ReportReason;
  details?: string;
  message?: { text: string; at: string }; // el mensaje adjunto, sin filtrar
  at: string;
};

export type ModerationSummary = {
  muted: MutedPlayer[]; // el que termina antes primero
  log: ModerationLogEntry[]; // la más nueva primero
  reports: OpenReport[]; // sin resolver, el más nuevo primero
};
