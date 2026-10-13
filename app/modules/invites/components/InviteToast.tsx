// Aviso flotante: la invitación que te llegó (Unirme / Ahora no) y los avisos para quien invita.
// Mientras está en pantalla mantiene abierta la conexión social con el servidor de juego.
import { useInvitesStore } from "../store";

// Ref de callback fuera del componente (siempre la misma): abre la conexión al aparecer y la cierra al irse
function connectWhileVisible(element: HTMLDivElement | null) {
  if (element) return useInvitesStore.getState().connect();
}

export function InviteToast() {
  const { incoming, notice, answer } = useInvitesStore();

  return (
    <div ref={connectWhileVisible} className="fixed top-20 right-4 z-50 flex w-75 flex-col gap-2">
      {incoming && (
        <div role="status" className="tarjeta-flotante flex flex-col gap-2.5 p-3.5">
          <p className="text-etiqueta">
            <b>{incoming.dname}</b> te invitó a una partida.
          </p>
          <div className="flex gap-2">
            <button onClick={() => answer(true)} className="btn btn-primario flex-1">
              Unirme
            </button>
            <button onClick={() => answer(false)} className="btn btn-secundario flex-1">
              Ahora no
            </button>
          </div>
        </div>
      )}
      {notice && (
        <p role="status" className="tarjeta-flotante text-etiqueta p-3 font-bold">
          {notice}
        </p>
      )}
    </div>
  );
}
