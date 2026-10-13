// Lo mínimo de la API de Ruffle (emulador de Flash) que usa este módulo.

export type RuffleConfig = {
  url: string;
  parameters?: Record<string, string>; // flashvars del SWF
  // El SWF se conecta a host:port por socket; Ruffle lo manda a un WebSocket (proxyUrl)
  socketProxy?: { host: string; port: number; proxyUrl: string }[];
  // [patrón, reemplazo]: cambia las URLs que pide el SWF (p. ej. http://localhost/... → /game/...)
  urlRewriteRules?: [RegExp | string, string][];
  // Motor de dibujado; por defecto Ruffle elige el primero que funcione (webgpu, wgpu-webgl, webgl, canvas)
  preferredRenderer?: "webgpu" | "wgpu-webgl" | "webgl" | "canvas";
  autoplay?: "auto" | "on" | "off";
  unmuteOverlay?: "visible" | "hidden";
  letterbox?: "fullscreen" | "off" | "on";
  quality?: "low" | "medium" | "high";
  allowScriptAccess?: boolean; // ExternalInterface entre el SWF y la página
};

export type RufflePlayerElement = HTMLElement & {
  ruffle(): { load(config: RuffleConfig): Promise<void>; volume: number }; // volume: 0 a 1
  // Agregada por el parche del SWF (build-swf.ts): pide el dibujo de una mascota; responde con
  // window.wildRevivalPet(id, píxeles). Aparece cuando el juego termina de arrancar
  requestPet?(id: string, pet: object, size: number): void;
};

declare global {
  interface Window {
    RufflePlayer?: { newest(): { createPlayer(): RufflePlayerElement } };
  }
}
