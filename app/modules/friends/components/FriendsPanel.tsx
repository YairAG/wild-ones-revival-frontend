import { Panel } from "@/components/Panel";
import { friends, requests } from "../mocks";

export function FriendsPanel() {
  const online = friends.filter((friend) => friend.online).length;

  return (
    <Panel
      title={`Amigos (${online}/${friends.length} en línea)`}
      footer={
        <div className="flex gap-2">
          <input
            disabled
            placeholder="Nombre del jugador"
            className="min-w-0 flex-1 rounded border border-stone-600 bg-stone-800 px-2 py-1 text-sm text-white"
          />
          <button
            disabled
            className="rounded bg-amber-600 px-3 text-sm font-semibold text-white opacity-50"
          >
            Agregar
          </button>
        </div>
      }
    >
      {requests.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-1 text-xs font-semibold text-stone-500 uppercase">Solicitudes</h3>
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between py-1 text-sm">
              <span className="text-white">{request.dname}</span>
              <span className="flex gap-2">
                <button disabled className="text-green-400">
                  Aceptar
                </button>
                <button disabled className="text-stone-400">
                  Rechazar
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-1 text-xs font-semibold text-stone-500 uppercase">Amigos</h3>
      {friends.map((friend) => (
        <div key={friend.id} className="flex items-center gap-2 py-1 text-sm">
          <span
            className={`size-2 rounded-full ${friend.online ? "bg-green-400" : "bg-stone-600"}`}
          />
          <span className="flex-1 text-white">{friend.dname}</span>
          <span className="text-xs text-stone-500">Nivel {friend.level}</span>
        </div>
      ))}
    </Panel>
  );
}
