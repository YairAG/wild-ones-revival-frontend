// Lo que devuelve el backend de cuentas en GET /friends (ver README de wildones-accounts).

/** Dónde está el jugador ahora (lo actualiza el servidor de juego) */
export type Presence = "playing" | "lobby" | "offline";

/** Un amigo en la lista */
export type Friend = {
  id: number;
  dname: string;
  level: number;
  presence: Presence;
};

/** Un jugador en una solicitud de amistad */
export type PlayerRef = {
  id: number;
  dname: string;
};

export type FriendsList = {
  friends: Friend[]; // en línea primero
  incoming: PlayerRef[]; // solicitudes que te enviaron
  outgoing: PlayerRef[]; // solicitudes que enviaste
  blocked: PlayerRef[]; // jugadores que bloqueaste
};
