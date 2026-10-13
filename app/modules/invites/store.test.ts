import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { readMessages } from "./services/social-connection";
import type { SocialServerMessage } from "./types";

// Conexión simulada: guarda lo que se envía y deja "recibir" mensajes del servidor
const sent: object[] = [];
let receive: (message: SocialServerMessage) => void = () => {};
vi.mock("./services/social-connection", async (original) => ({
  ...(await original<typeof import("./services/social-connection")>()),
  openSocialConnection: (_token: string, onMessage: (m: SocialServerMessage) => void) => {
    receive = onMessage;
    return { send: (m: object) => sent.push(m), close: () => {} };
  },
}));

const { useInvitesStore } = await import("./store");
let close: () => void;

beforeEach(() => {
  sent.length = 0;
  useInvitesStore.setState({ incoming: null, notice: null });
  close = useInvitesStore.getState().connect();
});
afterEach(() => close());

test("lee los mensajes del servidor: la cabecera de la primera respuesta y varios juntos", () => {
  const a = JSON.stringify({ command: "social_ready" });
  const b = JSON.stringify({ command: "invite_error", error: "x" });
  const data = `Originality is undetected plagiarism.\r\n\r\n0000${a.length}${a}0000${b.length}${b}`;
  expect(readMessages(data)).toEqual([
    { command: "social_ready" },
    { command: "invite_error", error: "x" },
  ]);
});

test("invitar manda el id del amigo", () => {
  useInvitesStore.getState().invite(2);
  expect(sent).toEqual([{ command: "invite", to: 2 }]);
});

test("una invitación recibida se muestra y al responder se envía la respuesta", () => {
  receive({ command: "invite", from: { id: 1, dname: "Ana" } });
  expect(useInvitesStore.getState().incoming).toEqual({ id: 1, dname: "Ana" });

  useInvitesStore.getState().answer(true);
  expect(sent).toEqual([{ command: "invite_answer", from: 1, accept: true }]);
  expect(useInvitesStore.getState().incoming).toBeNull();
});

test("los avisos para quien invita se quitan solos a los 5 s", () => {
  vi.useFakeTimers();
  receive({ command: "invite_declined", by: { id: 2, dname: "Beto" } });
  expect(useInvitesStore.getState().notice).toBe("Beto no puede jugar ahora");
  vi.advanceTimersByTime(5_000);
  expect(useInvitesStore.getState().notice).toBeNull();
  vi.useRealTimers();
});
