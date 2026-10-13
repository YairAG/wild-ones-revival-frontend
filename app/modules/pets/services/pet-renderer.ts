// Reproductor aparte e invisible, solo para dibujar mascotas: el mismo SWF en modo retrato (petRenderer=1, ver
// scripts/build-swf.ts), que carga datos y dibujos pero no se conecta al lobby. Usa el motor wgpu-webgl de
// Ruffle, que sí sabe dibujar en BitmapData (el del juego, webgl, no). Se crea al primer pedido y queda vivo.
import { gameConfig, loadRuffleScript } from "@/modules/game/services/ruffle";
import type { RufflePlayerElement } from "@/modules/game/types";

let player: Promise<RufflePlayerElement> | null = null;

export function petRenderer(): Promise<RufflePlayerElement> {
  player ??= (async () => {
    await loadRuffleScript();
    const element = window.RufflePlayer!.newest().createPlayer();
    // 1 px y transparente: tiene que estar en la página para correr, pero no se ve ni estorba
    element.style.cssText =
      "position:fixed;right:0;bottom:0;width:1px;height:1px;opacity:0;pointer-events:none";
    element.setAttribute("aria-hidden", "true");
    document.body.appendChild(element);
    await element.ruffle().load({
      ...gameConfig("retratos", ""),
      parameters: { petRenderer: "1", dname: "retratos", net: "M" },
      socketProxy: [], // no se conecta a nada
      preferredRenderer: "wgpu-webgl",
      // Deja que la página llame a requestPet y que el SWF responda con wildRevivalPet. El SWF original también
      // intenta llamar funciones de la página de Facebook de 2013 (switchView, sendGift...), que aquí no existen
      allowScriptAccess: true,
    });
    element.ruffle().volume = 0;
    return element;
  })();
  return player;
}
