// Cómo se dice dónde está un jugador (amigos y perfil)
import type { Presence } from "./types";

export const presenceLabel: Record<Presence, string> = {
  playing: "En partida",
  lobby: "En lobby",
  offline: "Desconectado",
};
