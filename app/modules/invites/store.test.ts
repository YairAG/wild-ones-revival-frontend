import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { readMessages } from "./services/social-connection";
import type { SocialServerMessage } from "./types";

// Conexión simulada: guarda lo que se envía y deja "recibir" mensajes del servidor
const sent: object[] = [];
let receive: (message: SocialServerMessage) => void = () => {};
let drop: () => void = () => {};
let opened = 0; // cuántas veces se abrió la conexión
vi.mock("./services/social-connection", async (original) => ({
  ...(await original<typeof import("./services/social-connection")>()),
  openSocialConnection: (
    _token: string,
    onMessage: (m: SocialServerMessage) => void,
    onClose: () => void,
  ) => {
    opened++;
    receive = onMessage;
    drop = onClose;
    return { send: (m: object) => sent.push(m), close: () => {} };
  },
}));

const { useInvitesStore } = await import("./store");
const { useGameStore } = await import("@/modules/game/store");
const ok = (message: string) => ({ ok: true as const, code: 200, message });
let close: () => void;

beforeEach(() => {
  sent.length = 0;
  useInvitesStore.setState({ incoming: null, notice: null });
  close = useInvitesStore.getState().connect();
});
afterEach(() => close());

test("lee los mensajes del servidor: la cabecera de la primera respuesta y varios juntos", () => {
  const a = JSON.stringify({ command: "social_ready", ok: true, code: 200, message: "Conectado" });
  const b = JSON.stringify({ command: "error", ok: false, code: 404, message: "x", error: "X" });
  const data = `Originality is undetected plagiarism.\r\n\r\n0000${a.length}${a}0000${b.length}${b}`;
  expect(readMessages(data)).toEqual([
    { command: "social_ready", ok: true, code: 200, message: "Conectado" },
    { command: "error", ok: false, code: 404, message: "x", error: "X" },
  ]);
});

test("invitar manda el id del amigo", () => {
  useInvitesStore.getState().invite(2);
  expect(sent).toEqual([{ command: "invite", to: 2 }]);
});

test("una invitación recibida se muestra y al responder se envía la respuesta", () => {
  receive({
    command: "invite",
    from: { id: 1, dname: "Ana" },
    ...ok("Ana te invitó a una partida"),
  });
  expect(useInvitesStore.getState().incoming).toEqual({ id: 1, dname: "Ana" });

  useInvitesStore.getState().answer(true);
  expect(sent).toEqual([{ command: "invite_answer", from: 1, accept: true }]);
  expect(useInvitesStore.getState().incoming).toBeNull();
});

test("los avisos para quien invita se quitan solos a los 5 s", () => {
  vi.useFakeTimers();
  receive({
    command: "invite_declined",
    by: { id: 2, dname: "Beto" },
    ...ok("Beto no puede jugar ahora"),
  });
  expect(useInvitesStore.getState().notice).toBe("Beto no puede jugar ahora");
  vi.advanceTimersByTime(5_000);
  expect(useInvitesStore.getState().notice).toBeNull();
  vi.useRealTimers();
});

test("si se cae la conexión reintenta a los 5 s; al volver, recarga el juego", () => {
  vi.useFakeTimers();
  const restart = vi.spyOn(useGameStore.getState(), "restart").mockImplementation(() => {});
  const before = opened;
  drop();
  expect(useInvitesStore.getState().reconnect).toMatchObject({ lost: true, secondsLeft: 5 });
  vi.advanceTimersByTime(5_000);
  expect(opened).toBe(before + 1);

  receive({ command: "social_ready", ...ok("Conectado") });
  expect(useInvitesStore.getState().reconnect.lost).toBe(false);
  expect(restart).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
