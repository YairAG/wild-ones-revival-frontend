// Panel de amigos: lista con presencia, solicitudes y formulario para agregar por nombre.
import type { FormEvent } from "react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Panel } from "@/components/Panel";
import { useInvitesStore } from "@/modules/invites/store";
import { useProfileStore } from "@/modules/profile/store";
import { useFriendsStore } from "../store";
import { presenceLabel } from "../presence";

// Ref de callback fuera del componente (siempre la misma): mientras el panel está en pantalla, la lista
// se recarga sola; al quitarlo, React llama a la función que devuelve y se detiene
function refreshWhileVisible(element: HTMLDivElement | null) {
  if (element) return useFriendsStore.getState().startRefreshing();
}

async function addFriend(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const dname = String(new FormData(form).get("dname")).trim();
  if (dname && (await useFriendsStore.getState().send(dname))) form.reset();
}

export function FriendsPanel() {
  const { list, error, accept, dismiss, unblock, confirmingRemove, askRemove, remove } =
    useFriendsStore();
  const online = list.friends.filter((friend) => friend.presence !== "offline").length;

  return (
    <Panel
      title="Amigos"
      badge={<span className="text-ayuda font-extrabold text-cielo">En línea · {online}</span>}
      footer={
        <form onSubmit={addFriend} className="flex w-full gap-2">
          <label htmlFor="agregar-amigo" className="sr-only">
            Nombre del jugador
          </label>
          <input
            id="agregar-amigo"
            name="dname"
            placeholder="Nombre del jugador"
            maxLength={16}
            autoComplete="off"
            className="campo min-w-0 flex-1"
          />
          <button className="btn btn-secundario">Agregar</button>
        </form>
      }
    >
      <div ref={refreshWhileVisible} className="flex flex-col gap-3">
        <ErrorMessage message={error} />

        {list.incoming.length > 0 && (
          <section>
            <h3 className="text-micro mb-1 font-extrabold text-texto-secundario uppercase">
              Te quieren agregar
            </h3>
            {list.incoming.map((player) => (
              <div key={player.id} className="flex min-h-11 items-center justify-between gap-2">
                <span className="text-cuerpo font-bold">{player.dname}</span>
                <span className="flex gap-1.5">
                  <button onClick={() => accept(player.id)} className="btn btn-fila btn-secundario">
                    Aceptar
                  </button>
                  <button onClick={() => dismiss(player.id)} className="btn btn-fila btn-texto">
                    Rechazar
                  </button>
                </span>
              </div>
            ))}
          </section>
        )}

        <section>
          <h3 className="text-micro mb-1 font-extrabold text-texto-secundario uppercase">Amigos</h3>
          {list.friends.length === 0 && (
            <p className="ayuda">Todavía no tienes amigos. Agrégalos por su nombre abajo.</p>
          )}
          {list.friends.map((friend) => {
            const isOnline = friend.presence !== "offline";
            // Esta fila pide confirmación para quitarlo
            if (confirmingRemove === friend.id) {
              return (
                <div key={friend.id} className="flex min-h-11 items-center justify-between gap-2">
                  <span className="text-etiqueta font-bold">¿Quitar a {friend.dname}?</span>
                  <span className="flex gap-1.5">
                    <button onClick={() => remove(friend.id)} className="btn btn-fila btn-peligro">
                      Quitar
                    </button>
                    <button onClick={() => askRemove(null)} className="btn btn-fila btn-texto">
                      No
                    </button>
                  </span>
                </div>
              );
            }
            return (
              <div key={friend.id} className="flex min-h-11 items-center gap-2.5">
                <span
                  className={`estado ${isOnline ? "estado-en-linea" : "estado-desconectado"}`}
                />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  {/* El nombre abre su perfil */}
                  <button
                    onClick={() => useProfileStore.getState().show(friend.id)}
                    className={`text-cuerpo truncate text-left font-bold hover:underline ${isOnline ? "text-texto" : "text-texto-terciario"}`}
                  >
                    {friend.dname}
                  </button>
                  <span className="text-micro font-semibold text-texto-secundario">
                    {presenceLabel[friend.presence]} · Nivel {friend.level}
                  </span>
                </span>
                {/* Solo se puede invitar a quien está en el lobby del juego */}
                {friend.presence === "lobby" && (
                  <button
                    onClick={() => useInvitesStore.getState().invite(friend.id)}
                    className="btn btn-fila btn-secundario"
                  >
                    Invitar
                  </button>
                )}
                <button
                  onClick={() => askRemove(friend.id)}
                  aria-label={`Quitar a ${friend.dname}`}
                  className="btn btn-fila btn-texto text-texto-terciario"
                >
                  Quitar
                </button>
              </div>
            );
          })}
        </section>

        {list.outgoing.length > 0 && (
          <section>
            <h3 className="text-micro mb-1 font-extrabold text-texto-secundario uppercase">
              Solicitudes enviadas
            </h3>
            {list.outgoing.map((player) => (
              <div key={player.id} className="flex min-h-11 items-center justify-between gap-2">
                <span className="text-cuerpo font-bold text-texto-terciario">{player.dname}</span>
                <button onClick={() => dismiss(player.id)} className="btn btn-fila btn-texto">
                  Cancelar
                </button>
              </div>
            ))}
          </section>
        )}

        {list.blocked.length > 0 && (
          <section>
            <h3 className="text-micro mb-1 font-extrabold text-texto-secundario uppercase">
              Bloqueados
            </h3>
            {list.blocked.map((player) => (
              <div key={player.id} className="flex min-h-11 items-center justify-between gap-2">
                <span className="text-cuerpo font-bold text-texto-terciario">{player.dname}</span>
                <button onClick={() => unblock(player.id)} className="btn btn-fila btn-texto">
                  Desbloquear
                </button>
              </div>
            ))}
          </section>
        )}
      </div>
    </Panel>
  );
}
