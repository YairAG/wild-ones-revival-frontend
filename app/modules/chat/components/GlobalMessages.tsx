// Mensajes del chat global: como conversación (los tuyos a la derecha), con menciones resaltadas y, si eres
// moderador, botones para borrar y silenciar.
import { useAuthStore } from "@/modules/auth/store";
import { useFriendsStore } from "@/modules/friends/store";
import { useProfileStore } from "@/modules/profile/store";
import { useSettingsStore } from "@/modules/settings/store";
import { mentions } from "../mentions";
import { useChatStore } from "../store";
import { scrollIntoView, time } from "./chat-helpers";

export function GlobalMessages() {
  const { messages, mod, connected, remove, askMute } = useChatStore();
  const me = useAuthStore((s) => s.session);
  const { showChatTime, highlightMentions } = useSettingsStore((s) => s.preferences);
  // Los mensajes de quien bloqueaste no se muestran
  const blocked = useFriendsStore((s) => s.list.blocked);
  const visible = messages.filter((m) => !blocked.some((b) => b.id === m.userId));

  return (
    <>
      {connected && visible.length === 0 && (
        <p className="ayuda">Nadie ha escrito todavía. ¡Saluda!</p>
      )}
      {visible.map((message, i) => {
        const mine = message.userId === me?.id;
        const mentionsMe = !mine && highlightMentions && mentions(message.text, me?.dname ?? "");
        const background = mine
          ? "self-end bg-nube text-right"
          : mentionsMe
            ? "self-start chat-mencion"
            : "self-start bg-campo";
        return (
          <div
            key={message.id}
            ref={i === visible.length - 1 ? scrollIntoView : undefined}
            className={`max-w-[85%] rounded-control px-2.5 py-1.5 [overflow-wrap:anywhere] ${background}`}
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
              {showChatTime && <span className="chat-hora mr-0">{time(message.at)}</span>}
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
    </>
  );
}
