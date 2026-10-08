import { Panel } from "@/components/Panel";
import { messages } from "../mocks";

export function GlobalChatPanel() {
  return (
    <Panel
      title="Chat global"
      footer={
        <input
          disabled
          placeholder="Próximamente..."
          className="w-full rounded border border-stone-600 bg-stone-800 px-2 py-1 text-sm text-white"
        />
      }
    >
      {messages.map((message) => (
        <p key={message.id} className="mb-1 text-sm">
          <span className="text-xs text-stone-500">{message.time} </span>
          <span className="font-semibold text-amber-400">{message.dname}: </span>
          <span className="text-stone-200">{message.text}</span>
        </p>
      ))}
    </Panel>
  );
}
