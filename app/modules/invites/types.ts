// Mensajes de la conexión social con el servidor de juego (ver PROTOCOL.md, 4.1 Social).
import type { PlayerRef } from "@/modules/friends/types";
import type { Failure, Success } from "@/services/types";

// Cada mensaje trae { ok, code, message } (ver app/services/types.ts); los errores llegan con command "error"
export type SocialServerMessage =
  | ({ command: "social_ready" } & Success)
  | ({ command: "invite"; from: PlayerRef } & Success) // te invitaron
  | ({ command: "invite_sent"; to: PlayerRef } & Success)
  | ({ command: "invite_accepted"; by: PlayerRef } & Success) // aceptaron: el juego te lleva a la sala
  | ({ command: "invite_declined"; by: PlayerRef } & Success)
  | ({ command: "error" } & Failure);
