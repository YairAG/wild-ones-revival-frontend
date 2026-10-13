// Panel de moderación (modal): jugadores silenciados, con botón para quitarles el silencio, y el registro de
// las últimas acciones de los moderadores.
import { ErrorMessage } from "@/components/ErrorMessage";
import { Modal } from "@/components/Modal";
import { useModerationStore } from "../store";
import type { ModerationLogEntry } from "../types";

// "13 oct, 19:30"
const when = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

// "5 min", "1 h", "1 día", "7 días"
function duration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} h`;
  const days = Math.round(minutes / (24 * 60));
  return `${days} ${days === 1 ? "día" : "días"}`;
}

function describe(entry: ModerationLogEntry) {
  const { mod, target } = entry;
  switch (entry.action) {
    case "delete":
      return `${mod.dname} borró un mensaje de ${target.dname}: "${entry.text}"`;
    case "mute":
      return (
        `${mod.dname} silenció a ${target.dname} ${duration(entry.minutes ?? 0)}` +
        (entry.reason ? ` · ${entry.reason}` : "")
      );
    case "unmute":
      return `${mod.dname} le quitó el silencio a ${target.dname}`;
  }
}

export function ModerationDialog() {
  const { open, summary, error, hide, unmute } = useModerationStore();
  if (!open) return null;

  return (
    <Modal title="Moderación" onClose={hide} wide>
      <ErrorMessage message={error} />
      {!summary && !error && <p className="ayuda">Cargando...</p>}
      {summary && (
        <div className="flex max-h-[60svh] flex-col gap-4 overflow-y-auto">
          <section>
            <h3 className="text-micro mb-1 font-extrabold text-texto-secundario uppercase">
              Silenciados
            </h3>
            {summary.muted.length === 0 && <p className="ayuda">Nadie está silenciado.</p>}
            {summary.muted.map((player) => (
              <div key={player.id} className="flex min-h-11 items-center justify-between gap-2">
                <span className="flex flex-col leading-tight">
                  <span className="text-cuerpo font-bold">{player.dname}</span>
                  <span className="text-micro font-semibold text-texto-secundario">
                    Hasta el {when(player.until)}
                  </span>
                </span>
                <button onClick={() => unmute(player.id)} className="btn btn-fila btn-secundario">
                  Quitar silencio
                </button>
              </div>
            ))}
          </section>
          <section>
            <h3 className="text-micro mb-1 font-extrabold text-texto-secundario uppercase">
              Registro
            </h3>
            {summary.log.length === 0 && <p className="ayuda">Todavía no hay acciones.</p>}
            <ul className="flex flex-col gap-1.5">
              {summary.log.map((entry, i) => (
                <li key={i} className="text-etiqueta text-texto-cuerpo [overflow-wrap:anywhere]">
                  <span className="chat-hora">{when(entry.at)}</span>
                  {describe(entry)}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
      <button onClick={hide} className="btn btn-secundario">
        Cerrar
      </button>
    </Modal>
  );
}
