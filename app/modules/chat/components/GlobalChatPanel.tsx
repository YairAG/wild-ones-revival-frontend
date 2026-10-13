// Panel del chat, con dos pestañas: Global y Privados. Una sola conexión para los dos; el formulario de abajo
// escribe al global o a la conversación privada abierta.
import type { FormEvent, ReactNode } from "react";
import { Panel } from "@/components/Panel";
import { ModerationDialog } from "@/modules/moderation/components/ModerationDialog";
import { useModerationStore } from "@/modules/moderation/store";
import { useChatStore } from "../store";
import type { ChatView } from "../types";
import { DirectMessages } from "./DirectMessages";
import { GlobalMessages } from "./GlobalMessages";
import { MuteDialog } from "./MuteDialog";

// Ref de callback fuera del componente (siempre la misma): mientras el panel está en pantalla la conexión sigue
// abierta; al quitarlo, React llama a la función que devuelve y se cierra
function connectWhileVisible(element: HTMLDivElement | null) {
  if (element) return useChatStore.getState().connect();
}

function sendMessage(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const text = String(new FormData(form).get("text")).trim();
  if (!text) return;
  useChatStore.getState().send(text);
  form.reset();
}

function Tab({ view, label, badge }: { view: ChatView; label: string; badge?: ReactNode }) {
  const current = useChatStore((s) => s.view);
  const active = current === view;
  return (
    <button
      onClick={() => useChatStore.getState().setView(view)}
      aria-pressed={active}
      className={`flex h-11.5 flex-1 items-center justify-center gap-2 font-display text-[17px] ${active ? "bg-panel text-texto shadow-[inset_0_-3px_0_var(--color-naranja)]" : "text-texto-secundario"}`}
    >
      {label}
      {badge}
    </button>
  );
}

export function GlobalChatPanel() {
  const {
    view,
    thread,
    connected,
    reconnect,
    reconnectNow,
    notice,
    mod,
    mentioned,
    conversations,
  } = useChatStore();
  const unread = conversations.reduce((total, c) => total + c.unread, 0);
  const canWrite = connected && (view === "global" || thread !== null);
  const placeholder = !connected
    ? "Conectando..."
    : view === "global"
      ? "Escribe un mensaje"
      : thread
        ? `Mensaje para ${thread.dname}`
        : "Elige una conversación";

  return (
    <Panel
      title="Chat"
      header={
        <>
          <Tab
            view="global"
            label="Global"
            badge={
              mentioned && (
                <span className="size-2 rounded-full bg-naranja" aria-label="Te mencionaron" />
              )
            }
          />
          <Tab
            view="dms"
            label="Privados"
            badge={
              unread > 0 && (
                <span className="rounded-[3px] bg-naranja px-1.5 py-px font-sans text-micro font-extrabold text-sobre-naranja">
                  {unread}
                </span>
              )
            }
          />
          {mod && (
            <button
              onClick={() => useModerationStore.getState().show()}
              className="text-ayuda px-3 font-extrabold text-moderacion"
            >
              Moderación
            </button>
          )}
        </>
      }
      footer={
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <label htmlFor="chat-mensaje" className="sr-only">
            Mensaje
          </label>
          <input
            id="chat-mensaje"
            name="text"
            disabled={!canWrite}
            placeholder={placeholder}
            maxLength={200}
            autoComplete="off"
            className="campo min-w-0 flex-1"
          />
          {/* Azul solo si está activo: si no, manda el estilo .btn:disabled del sistema de diseño */}
          <button
            disabled={!canWrite}
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
        {view === "global" ? <GlobalMessages /> : <DirectMessages />}
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
