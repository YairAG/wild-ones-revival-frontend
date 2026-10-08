// Carga el cliente original (SWF) con Ruffle y lo conecta a nuestros servidores.
// Los archivos originales están en public/game/ (no van a git: ver README).
import type { RuffleConfig, RufflePlayerElement } from "../types";

const RUFFLE_SCRIPT = "https://unpkg.com/@ruffle-rs/ruffle@0.7.1/ruffle.js";
const GAME_URL = import.meta.env.VITE_GAME_URL; // WebSocket del servidor de juego

// Puerto TCP al que el SWF original intenta conectarse (está fijo dentro del SWF)
const SWF_SERVER_PORT = 8000;

// El SWF elige servidor según la URL desde la que se cargó (Common.initServerPath): localhost, unas IP fijas
// o los dominios de los servidores privados de 2018. Todos se redirigen a nuestros servidores.
const SWF_KNOWN_HOSTS = [
  "localhost",
  "127.0.0.1",
  "25.7.72.108",
  "107.175.80.140",
  "beta-heroes.tk",
  "betaheroes.tk",
  "wildheroes.pw",
  "nuke.mice.ninja",
  "wildones.pw",
  "www.wildones.pw",
];

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Agrega el script de Ruffle a la página (una sola vez) */
function loadRuffleScript(): Promise<void> {
  if (window.RufflePlayer?.newest) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RUFFLE_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Ruffle"));
    document.head.appendChild(script);
  });
}

/** Configuración para el SWF: login con el token y redirecciones a nuestros servidores */
export function gameConfig(dname: string, token: string): RuffleConfig {
  const origin = window.location.origin;
  return {
    url: `${origin}/game/publicV1.swf`,
    // El SWF lee su login de estos parámetros; en snum va el JWT (el servidor lo acepta ahí)
    parameters: { dname, snum: token, net: "M" },
    // Sus archivos se sirven desde public/game/:
    urlRewriteRules: [
      // 1. Pedidos a los servidores conocidos del SWF (sin puerto o puerto 80)
      [
        new RegExp(`^https?://(?:${SWF_KNOWN_HOSTS.map(escapeRegExp).join("|")})(?::80)?/(.*)$`),
        `${origin}/game/$1`,
      ],
      // 2. Pedidos a esta misma web fuera de /game/ (p. ej. "../assets/...")
      [new RegExp(`^${escapeRegExp(origin)}/((?:assets|images)/.*)$`), `${origin}/game/$1`],
    ],
    socketProxy: SWF_KNOWN_HOSTS.map((host) => ({
      host,
      port: SWF_SERVER_PORT,
      proxyUrl: GAME_URL,
    })),
    // Con el motor por defecto los cráteres no se veían hasta el final de la partida
    preferredRenderer: "webgl",
    autoplay: "on",
    unmuteOverlay: "hidden",
    letterbox: "on",
  };
}

/** Crea el reproductor dentro de `container` y arranca el juego */
export async function startGame(
  container: HTMLElement,
  dname: string,
  token: string,
): Promise<RufflePlayerElement> {
  await loadRuffleScript();
  const player = window.RufflePlayer!.newest().createPlayer();
  player.style.width = "100%";
  player.style.height = "100%";
  container.appendChild(player);
  await player.ruffle().load(gameConfig(dname, token));
  return player;
}
