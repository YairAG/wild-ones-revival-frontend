import { Panel } from "@/components/Panel";
import { friends, requests } from "../mocks";

export function FriendsPanel() {
  const online = friends.filter((friend) => friend.online).length;

  return (
    <Panel
      title="Amigos"
      badge={<span className="text-ayuda font-extrabold text-cielo">En línea · {online}</span>}
      footer={
        <>
          <label htmlFor="agregar-amigo" className="sr-only">
            Nombre del jugador
          </label>
          <input
            id="agregar-amigo"
            disabled
            placeholder="Nombre del jugador"
            className="campo min-w-0 flex-1"
          />
          <button disabled className="btn btn-secundario">
            Agregar
          </button>
        </>
      }
    >
      {requests.length > 0 && (
        <div className="mb-3 flex flex-col">
          <h3 className="text-micro mb-1 font-extrabold text-texto-secundario uppercase">
            Solicitudes
          </h3>
          {requests.map((request) => (
            <div key={request.id} className="flex min-h-11 items-center justify-between gap-2">
              <span className="text-cuerpo font-bold">{request.dname}</span>
              <span className="flex gap-1.5">
                <button disabled className="btn btn-fila btn-secundario">
                  Aceptar
                </button>
                <button disabled className="btn btn-fila btn-secundario">
                  Rechazar
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <h3 className="text-micro mb-1 font-extrabold text-texto-secundario uppercase">Amigos</h3>
      {friends.map((friend) => (
        <div key={friend.id} className="flex min-h-11 items-center gap-2.5">
          <span className={`estado ${friend.online ? "estado-en-linea" : "estado-desconectado"}`} />
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span
              className={`text-cuerpo truncate font-bold ${friend.online ? "text-texto" : "text-texto-terciario"}`}
            >
              {friend.dname}
            </span>
            <span className="text-micro font-semibold text-texto-secundario">
              {friend.online ? "En línea" : "Desconectado"} · Nivel {friend.level}
            </span>
          </span>
        </div>
      ))}
    </Panel>
  );
}
