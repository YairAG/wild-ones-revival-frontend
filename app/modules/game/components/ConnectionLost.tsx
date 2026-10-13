// Aviso encima del juego cuando se cae el servidor de juego (se cerró la conexión social): reintenta solo con
// cuenta regresiva, o a mano con "Reconectar ya". Solo tapa el juego: amigos y chat siguen usables.
import { useAuthStore } from "@/modules/auth/store";
import { useInvitesStore } from "@/modules/invites/store";
import { MAX_ATTEMPTS, RETRY_SECONDS } from "@/services/reconnect";

export function ConnectionLost() {
  const { reconnect, reconnectNow } = useInvitesStore();
  if (!reconnect.lost) return null;

  const { failed, attempt, secondsLeft } = reconnect;
  const progress = failed ? 100 : ((RETRY_SECONDS - secondsLeft) / RETRY_SECONDS) * 100;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[rgb(22_38_48/0.6)] p-4">
      <section
        role="alertdialog"
        aria-labelledby="conexion-perdida"
        className="flex w-80 max-w-full flex-col gap-2.5 rounded-modal border-2 border-cielo-profundo bg-panel p-4.5 shadow-nivel-1"
      >
        <h2 id="conexion-perdida" className="panel-titulo">
          {failed ? "No se pudo reconectar" : "Se perdió la conexión"}
        </h2>
        <p className="text-etiqueta text-texto-cuerpo">
          {failed ? (
            "El servidor de juego no responde. Puede estar en mantenimiento."
          ) : secondsLeft > 0 ? (
            <>
              Reintentando en <b>{secondsLeft} s</b> · intento {attempt + 1} de {MAX_ATTEMPTS}
            </>
          ) : (
            `Reconectando... intento ${attempt} de ${MAX_ATTEMPTS}`
          )}
        </p>
        <div className="h-2.5 overflow-hidden rounded-[3px] border-2 border-cielo-profundo bg-encabezado">
          <div className="h-full bg-naranja transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 flex gap-2">
          <button onClick={reconnectNow} className="btn btn-primario flex-1 whitespace-nowrap">
            {failed ? "Reintentar" : "Reconectar ya"}
          </button>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="btn btn-secundario flex-1 whitespace-nowrap"
          >
            Salir
          </button>
        </div>
      </section>
    </div>
  );
}
