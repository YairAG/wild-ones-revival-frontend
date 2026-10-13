// Panel del chat global: mensajes en tiempo real, formulario para escribir y, si eres moderador, botones para
// borrar mensajes y silenciar jugadores.
import type { FormEvent } from "react";
import { Panel } from "@/components/Panel";
import { useAuthStore } from "@/modules/auth/store";
import { MUTE_MINUTES, useChatStore } from "../store";

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
  const { messages, mod, connected, notice, remove, mute } = useChatStore();
  const myId = useAuthStore((s) => s.session?.id);

  return (
    <Panel
      title="Chat global"
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
        {connected && messages.length === 0 && (
          <p className="ayuda">Nadie ha escrito todavía. ¡Saluda!</p>
        )}
        {/* Como conversación: tus mensajes a la derecha (como "Tú"), los de los demás a la izquierda */}
        {messages.map((message, i) => {
          const mine = message.userId === myId;
          return (
            <div
              key={message.id}
              ref={i === messages.length - 1 ? scrollIntoView : undefined}
              className={`max-w-[85%] rounded-control px-2.5 py-1.5 [overflow-wrap:anywhere] ${mine ? "self-end bg-nube text-right" : "self-start bg-campo"}`}
            >
              <p>
                <span className="mr-1.5 font-extrabold text-texto">
                  {mine ? "Tú" : message.dname}
                </span>
                <span className="chat-hora mr-0">{time(message.at)}</span>
              </p>
              <p className="text-texto-cuerpo">{message.text}</p>
              {mod && (
                <p className="text-micro font-bold">
                  <button onClick={() => remove(message.id)} className="chat-moderacion">
                    Borrar
                  </button>
                  {!mine && (
                    <>
                      {" · "}
                      <button
                        onClick={() => mute(message.userId)}
                        title={`No podrá escribir en ${MUTE_MINUTES} min`}
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
      </div>
    </Panel>
  );
}
