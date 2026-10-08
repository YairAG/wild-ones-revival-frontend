// Maqueta: amigos de ejemplo. Después vendrán del backend de cuentas
import type { Friend, FriendRequest } from "./types";

export const friends: Friend[] = [
  { id: 2, dname: "Ernesto", level: 1, online: true },
  { id: 3, dname: "Peter", level: 12, online: false },
  { id: 4, dname: "Luna", level: 30, online: false },
];

export const requests: FriendRequest[] = [{ id: 5, dname: "Mick" }];
