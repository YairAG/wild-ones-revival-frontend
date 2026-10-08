// Maqueta: notas escritas a mano. Después vendrán del backend
import type { Release } from "./types";

export const releases: Release[] = [
  {
    date: "2026-10-08",
    title: "El juego en español",
    changes: [
      "Menús, tutorial, ayuda y tienda traducidos",
      "Se quitaron las compras con dinero real y los botones de Facebook",
      "La sesión ya no se pierde al recargar la página",
    ],
  },
  {
    date: "2026-10-07",
    title: "Primeras partidas",
    changes: [
      "Partidas de 2 jugadores con el cliente original",
      "Arreglado: tu propio misil ya no te hace daño al disparar",
      "Los cráteres del terreno se ven al momento",
    ],
  },
];
