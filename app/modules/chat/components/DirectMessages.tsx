// Pestaña de privados: la lista de conversaciones o, si hay una abierta, sus mensajes.
import { useAuthStore } from "@/modules/auth/store";
import { useProfileStore } from "@/modules/profile/store";
import { useSettingsStore } from "@/modules/settings/store";
import { useChatStore } from "../store";
import { scrollIntoView, time } from "./chat-helpers";

export function DirectMessages() {
  const thread = useChatStore((s) => s.thread);
  return thread ? <Thread /> : <ConversationList />;
}

function ConversationList() {
  const { conversations, openThread } = useChatStore();
  if (conversations.length === 0) {
    return (
      <p className="ayuda">
        Todavía no tienes mensajes privados. Abre el perfil de un jugador y toca "Mensaje".
      </p>
    );
  }
  return (
    <ul className="-mx-3.5 -my-3 flex flex-col">
      {conversations.map((c) => (
        <li key={c.with.id}>
          <button
            onClick={() => openThread(c.with)}
            className="flex w-full items-center gap-2.5 border-b-2 border-divisor px-3.5 py-3 text-left hover:bg-encabezado"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-cuerpo font-extrabold">{c.with.dname}</span>
              <span className="text-etiqueta truncate text-texto-secundario">
                {c.last.fromMe && "Tú: "}
                {c.last.text}
              </span>
            </span>
            {c.unread > 0 && (
              <span className="text-micro rounded-[3px] bg-naranja px-1.5 py-px font-extrabold text-sobre-naranja">
                {c.unread}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Thread() {
  const { thread, threadMessages, closeThread } = useChatStore();
  const myId = useAuthStore((s) => s.session?.id);
  const showTime = useSettingsStore((s) => s.preferences.showChatTime);
  if (!thread) return null;

  // Su nombre abre su perfil; si lo reportas, se adjunta el último mensaje que te mandó
  const lastFromThem = [...threadMessages].reverse().find((m) => m.from.id === thread.id);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="-mx-3.5 -mt-3 mb-1 flex items-center gap-1 border-b-2 border-divisor px-1.5 py-1">
        <button
          onClick={closeThread}
          aria-label="Volver a la lista de privados"
          className="flex size-9 items-center justify-center rounded-control text-cielo-profundo"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() => useProfileStore.getState().show(thread.id, lastFromThem)}
          className="text-cuerpo font-extrabold hover:underline"
        >
          {thread.dname}
        </button>
      </div>
      {threadMessages.length === 0 && <p className="ayuda">Escríbele el primer mensaje.</p>}
      {threadMessages.map((message, i) => {
        const mine = message.from.id === myId;
        return (
          <div
            key={message.id}
            ref={i === threadMessages.length - 1 ? scrollIntoView : undefined}
            className={`max-w-[85%] rounded-control px-2.5 py-1.5 [overflow-wrap:anywhere] ${mine ? "self-end bg-nube text-right" : "self-start bg-campo"}`}
          >
            {showTime && <p className="chat-hora mr-0">{time(message.at)}</p>}
            <p className="text-texto-cuerpo">{message.text}</p>
          </div>
        );
      })}
    </div>
  );
}
