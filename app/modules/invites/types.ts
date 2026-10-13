// Mensajes de la conexión social con el servidor de juego (ver PROTOCOL.md, 4.1 Social).
import type { PlayerRef } from "@/modules/friends/types";

export type SocialServerMessage =
  | { command: "social_ready" }
  | { command: "invite"; from: PlayerRef } // te invitaron
  | { command: "invite_sent"; to: PlayerRef }
  | { command: "invite_accepted"; by: PlayerRef } // aceptaron tu invitación: el juego te lleva a la sala
  | { command: "invite_declined"; by: PlayerRef }
  | { command: "invite_error"; error: string };
