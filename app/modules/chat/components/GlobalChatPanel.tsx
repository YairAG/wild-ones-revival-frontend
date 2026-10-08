import { Panel } from "@/components/Panel";
import { messages } from "../mocks";

export function GlobalChatPanel() {
  return (
    <Panel
      title="Chat global"
      footer={
        <>
          <label htmlFor="chat-mensaje" className="sr-only">
            Mensaje
          </label>
          <input
            id="chat-mensaje"
            disabled
            placeholder="Próximamente"
            className="h-11 min-w-0 flex-1 rounded border-2 border-line bg-field px-3 text-sm placeholder:text-disabled"
          />
          <button
            disabled
            className="h-11 rounded border-2 border-sky-deep bg-sky px-3.5 text-sm font-extrabold text-white disabled:opacity-60"
          >
            Enviar
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5 text-sm leading-snug">
        {messages.map((message) => (
          <p key={message.id} className="text-body [overflow-wrap:anywhere]">
            <span className="mr-1.5 text-[11px] font-bold text-faint">{message.time}</span>
            <span className="font-extrabold text-ink">{message.dname}</span>: {message.text}
          </p>
        ))}
      </div>
    </Panel>
  );
}
