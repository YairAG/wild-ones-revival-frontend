// Barra bajo el juego: si hay conexión con el servidor de juego, y botones de modo enfoque, recargar y
// pantalla completa.
import { useInvitesStore } from "@/modules/invites/store";
import { useGameStore } from "../store";

export function GameBar() {
  const { focus, toggleFocus, restart, fullscreen } = useGameStore();
  // La conexión social va al mismo servidor que el juego: si se cayó, se cayó el juego
  const lost = useInvitesStore((s) => s.reconnect.lost);

  return (
    <div className="text-ayuda flex flex-wrap items-center justify-between gap-2.5 font-bold text-texto-secundario">
      <span className="flex items-center gap-2">
        <span className={`estado ${lost ? "bg-error" : "estado-en-linea"}`} />
        {lost ? "Sin conexión con el servidor" : "Conectado"}
      </span>
      <span className="flex flex-wrap gap-2">
        <button
          onClick={toggleFocus}
          aria-pressed={focus}
          className={`btn btn-compacto ${focus ? "border-cielo-profundo bg-cielo text-white" : "btn-secundario"}`}
        >
          {focus ? "Mostrar paneles" : "Modo enfoque"}
        </button>
        <button onClick={restart} className="btn btn-compacto btn-secundario">
          Recargar
        </button>
        <button onClick={fullscreen} className="btn btn-compacto btn-secundario">
          Pantalla completa
        </button>
      </span>
    </div>
  );
}
