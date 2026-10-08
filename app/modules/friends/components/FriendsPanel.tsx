import { Panel } from "@/components/Panel";
import { friends, requests } from "../mocks";

export function FriendsPanel() {
  const online = friends.filter((friend) => friend.online).length;

  return (
    <Panel
      title="Amigos"
      badge={<span className="text-[13px] font-extrabold text-sky">En línea · {online}</span>}
      footer={
        <>
          <label htmlFor="agregar-amigo" className="sr-only">
            Nombre del jugador
          </label>
          <input
            id="agregar-amigo"
            disabled
            placeholder="Nombre del jugador"
            className="h-11 min-w-0 flex-1 rounded border-2 border-line bg-field px-3 text-sm placeholder:text-disabled"
          />
          <button
            disabled
            className="h-11 rounded border-2 border-sky-deep bg-sky px-3.5 text-sm font-extrabold text-white disabled:opacity-60"
          >
            Agregar
          </button>
        </>
      }
    >
      {requests.length > 0 && (
        <div className="mb-3 flex flex-col">
          <h3 className="mb-1 text-xs font-extrabold text-muted uppercase">Solicitudes</h3>
          {requests.map((request) => (
            <div key={request.id} className="flex min-h-11 items-center justify-between gap-2">
              <span className="text-[15px] font-bold">{request.dname}</span>
              <span className="flex gap-1.5">
                <button
                  disabled
                  className="h-8 rounded border-2 border-line bg-panel px-2.5 text-xs font-extrabold text-sky-deep"
                >
                  Aceptar
                </button>
                <button
                  disabled
                  className="h-8 rounded border-2 border-line bg-panel px-2.5 text-xs font-extrabold text-muted"
                >
                  Rechazar
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-1 text-xs font-extrabold text-muted uppercase">Amigos</h3>
      {friends.map((friend) => (
        <div key={friend.id} className="flex min-h-11 items-center gap-2.5">
          <span
            className={`size-2.5 shrink-0 rounded-full ${friend.online ? "bg-ok" : "bg-[#c3cdd2]"}`}
          />
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span
              className={`truncate text-[15px] font-bold ${friend.online ? "text-ink" : "text-faint"}`}
            >
              {friend.dname}
            </span>
            <span className="text-xs font-semibold text-muted">
              {friend.online ? "En línea" : "Desconectado"} · Nivel {friend.level}
            </span>
          </span>
        </div>
      ))}
    </Panel>
  );
}
