// Carga el cliente original (SWF) con Ruffle y lo conecta a nuestros servidores.
// Los archivos originales están en public/game/ (no van a git: ver README).
import type { RuffleConfig, RufflePlayerElement } from "../types";

const RUFFLE_SCRIPT = "https://unpkg.com/@ruffle-rs/ruffle@0.7.1/ruffle.js";
const GAME_URL = import.meta.env.VITE_GAME_URL; // WebSocket del servidor de juego

// Puerto TCP al que el SWF original intenta conectarse (está fijo dentro del SWF)
const SWF_SERVER_PORT = 8000;

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
    // El SWF pide sus archivos a http://localhost/...: se sirven desde public/game/
    urlRewriteRules: [
      [/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::80)?\/(.*)$/, `${origin}/game/$1`],
    ],
    socketProxy: [
      { host: "localhost", port: SWF_SERVER_PORT, proxyUrl: GAME_URL },
      { host: "127.0.0.1", port: SWF_SERVER_PORT, proxyUrl: GAME_URL },
    ],
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
