// Perfil de jugador y reportes (GET /players/:id y POST /reports del backend de cuentas).
import type { Presence } from "@/modules/friends/types";
import type { PetLook } from "@/modules/pets/types";

/** Tu relación con el jugador: outgoing = le enviaste solicitud, incoming = él te la envió */
export type Relation = "self" | "friends" | "outgoing" | "incoming" | "none";

export type PlayerProfile = {
  id: number;
  dname: string;
  level: number;
  wins: number;
  losses: number;
  gamecount: number; // partidas jugadas
  presence: Presence;
  pets: PetLook[]; // con lo necesario para dibujarlas; la actual tiene current: true
  mutualFriends: number;
  relation: Relation;
  blocked: boolean; // si tú lo bloqueaste
};

export type ReportReason = "harassment" | "cheating" | "inappropriate_name" | "spam" | "other";

/** El mensaje del chat desde el que se abrió el perfil (se adjunta al reportar) */
export type ReportedMessage = { id: string; text: string; at: string };

/** Qué muestra el modal: el perfil, el formulario de reporte o la confirmación */
export type ProfileStep = "profile" | "report" | "sent";
