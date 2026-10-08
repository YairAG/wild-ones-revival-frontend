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
            className="campo min-w-0 flex-1"
          />
          {/* Azul solo si está activo: si no, manda el estilo .btn:disabled del sistema de diseño */}
          <button
            disabled
            className="btn enabled:border-cielo-profundo enabled:bg-cielo enabled:text-white"
          >
            Enviar
          </button>
        </>
      }
    >
      <div className="text-etiqueta flex flex-col gap-1.5 leading-snug">
        {messages.map((message) => (
          <p key={message.id} className="text-texto-cuerpo [overflow-wrap:anywhere]">
            <span className="chat-hora">{message.time}</span>
            <span className="font-extrabold text-texto">{message.dname}</span>: {message.text}
          </p>
        ))}
      </div>
    </Panel>
  );
}
