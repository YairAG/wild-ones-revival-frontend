// Panel del chat global: mensajes en tiempo real, formulario para escribir y, si eres moderador, botones para
// borrar mensajes y silenciar jugadores.
import type { FormEvent } from "react";
import { Panel } from "@/components/Panel";
import { useAuthStore } from "@/modules/auth/store";
import { useFriendsStore } from "@/modules/friends/store";
import { useProfileStore } from "@/modules/profile/store";
import { useSettingsStore } from "@/modules/settings/store";
import { ModerationDialog } from "@/modules/moderation/components/ModerationDialog";
import { useModerationStore } from "@/modules/moderation/store";
import { useChatStore } from "../store";
import { MuteDialog } from "./MuteDialog";

// Refs de callback fuera del componente (siempre las mismas):
// mientras la lista está en pantalla la conexión sigue abierta; al quitarla, React llama a la función que
// devuelve y se cierra
function connectWhileVisible(element: HTMLDivElement | null) {
  if (element) return useChatStore.getState().connect();
}
// El último mensaje se hace visible al aparecer: así la lista baja sola cuando llega uno nuevo
function scrollIntoView(element: HTMLElement | null) {
  element?.scrollIntoView({ block: "nearest" });
}

function sendMessage(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const text = String(new FormData(form).get("text")).trim();
  if (!text) return;
  useChatStore.getState().send(text);
  form.reset();
}

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

export function GlobalChatPanel() {
  const { messages, mod, connected, reconnect, reconnectNow, notice, remove, askMute } =
    useChatStore();
  const myId = useAuthStore((s) => s.session?.id);
  const showTime = useSettingsStore((s) => s.preferences.showChatTime);
  // Los mensajes de quien bloqueaste no se muestran
  const blocked = useFriendsStore((s) => s.list.blocked);
  const visible = messages.filter((m) => !blocked.some((b) => b.id === m.userId));

  return (
    <Panel
      title="Chat global"
      badge={
        mod && (
          <button
            onClick={() => useModerationStore.getState().show()}
            className="text-ayuda font-extrabold text-moderacion"
          >
            Moderación
          </button>
        )
      }
      footer={
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <label htmlFor="chat-mensaje" className="sr-only">
            Mensaje
          </label>
          <input
            id="chat-mensaje"
            name="text"
            disabled={!connected}
            placeholder={connected ? "Escribe un mensaje" : "Conectando..."}
            maxLength={200}
            autoComplete="off"
            className="campo min-w-0 flex-1"
          />
          {/* Azul solo si está activo: si no, manda el estilo .btn:disabled del sistema de diseño */}
          <button
            disabled={!connected}
            className="btn enabled:border-cielo-profundo enabled:bg-cielo enabled:text-white"
          >
            Enviar
          </button>
        </form>
      }
    >
      <div ref={connectWhileVisible} className="text-etiqueta flex flex-col gap-1.5 leading-snug">
        {/* Se cayó la conexión: se reintenta sola; si se rinde, a mano */}
        {reconnect.lost && (
          <p role="status" className="ayuda font-bold">
            {reconnect.failed ? (
              <>
                No se pudo conectar con el chat.{" "}
                <button onClick={reconnectNow} className="text-enlace hover:text-enlace-hover">
                  Reintentar
                </button>
              </>
            ) : reconnect.secondsLeft > 0 ? (
              `Sin conexión con el chat. Reintentando en ${reconnect.secondsLeft} s`
            ) : (
              "Reconectando..."
            )}
          </p>
        )}
        {connected && visible.length === 0 && (
          <p className="ayuda">Nadie ha escrito todavía. ¡Saluda!</p>
        )}
        {/* Como conversación: tus mensajes a la derecha (como "Tú"), los de los demás a la izquierda */}
        {visible.map((message, i) => {
          const mine = message.userId === myId;
          return (
            <div
              key={message.id}
              ref={i === visible.length - 1 ? scrollIntoView : undefined}
              className={`max-w-[85%] rounded-control px-2.5 py-1.5 [overflow-wrap:anywhere] ${mine ? "self-end bg-nube text-right" : "self-start bg-campo"}`}
            >
              <p>
                {mine ? (
                  <span className="mr-1.5 font-extrabold text-texto">Tú</span>
                ) : (
                  // El nombre abre su perfil; si lo reportas, se adjunta este mensaje
                  <button
                    onClick={() => useProfileStore.getState().show(message.userId, message)}
                    className="mr-1.5 font-extrabold text-texto hover:underline"
                  >
                    {message.dname}
                  </button>
                )}
                {showTime && <span className="chat-hora mr-0">{time(message.at)}</span>}
              </p>
              {/* Si el filtro tapó algo, el moderador ve el original al pasar el mouse */}
              {message.original ? (
                <p
                  title={`Original: ${message.original}`}
                  className="cursor-help text-texto-cuerpo underline decoration-moderacion decoration-dotted"
                >
                  {message.text}
                </p>
              ) : (
                <p className="text-texto-cuerpo">{message.text}</p>
              )}
              {mod && (
                <p className="text-micro font-bold">
                  <button onClick={() => remove(message.id)} className="chat-moderacion">
                    Borrar
                  </button>
                  {!mine && (
                    <>
                      {" · "}
                      <button
                        onClick={() => askMute({ id: message.userId, dname: message.dname })}
                        className="chat-moderacion"
                      >
                        Silenciar
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
          );
        })}
        {notice && (
          <p role="status" className="ayuda font-bold">
            {notice}
          </p>
        )}
        <MuteDialog />
        <ModerationDialog />
      </div>
    </Panel>
  );
}
