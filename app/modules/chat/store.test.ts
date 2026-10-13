import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/store";
import { testSession } from "@/modules/auth/helpers/test-session";
import type { ChatMessage, ChatServerEvent } from "./types";

// Conexión simulada: guarda lo que se envía y deja "recibir" eventos del servidor o cortarla
const sent: object[] = [];
let receive: (event: ChatServerEvent) => void = () => {};
let drop: () => void = () => {};
vi.mock("./services/chat-connection", () => ({
  openChatConnection: (_token: string, onEvent: typeof receive, onClose: () => void) => {
    receive = onEvent;
    drop = onClose;
    return { send: (m: object) => sent.push(m), close: () => {} };
  },
}));

// Lectura de privados simulada (sin red): la conversación con Beto
const conversations = [
  {
    with: { id: 2, dname: "Beto" },
    last: { text: "hola", at: "2026-01-01T12:00:00Z", fromMe: false },
    unread: 1,
  },
];
const markRead = vi.fn();
vi.mock("./services/dms-api", () => ({
  dmsApi: {
    conversations: async () => conversations,
    thread: async () => ({ with: { id: 2, dname: "Beto" }, messages: [] }),
    markRead: async (id: number) => markRead(id),
  },
}));

const { useChatStore } = await import("./store");
const { mentions } = await import("./mentions");
let close: () => void;

const hola: ChatMessage = {
  id: "a1",
  userId: 2,
  dname: "Beto",
  text: "hola",
  at: "2026-01-01T12:00:00Z",
};

// connect pide antes un token vigente (async): se espera a que abra la conexión
beforeEach(async () => {
  sent.length = 0;
  useAuthStore.setState({ session: testSession });
  useChatStore.setState({
    messages: [],
    mod: false,
    connected: false,
    notice: null,
    muting: null,
    view: "global",
    thread: null,
    threadMessages: [],
    mentioned: false,
  });
  close = useChatStore.getState().connect();
  await new Promise((resolve) => setTimeout(resolve));
});
afterEach(() => close());

test("al entrar llega el historial y queda conectado", () => {
  receive({ type: "history", messages: [hola], mod: false });
  expect(useChatStore.getState()).toMatchObject({ messages: [hola], mod: false, connected: true });
});

test("los mensajes nuevos se agregan al final y los borrados se quitan", () => {
  receive({ type: "history", messages: [hola], mod: false });
  const otro = { ...hola, id: "a2", text: "¿una partida?" };
  receive({ type: "message", message: otro });
  expect(useChatStore.getState().messages).toEqual([hola, otro]);
  receive({ type: "deleted", id: "a1" });
  expect(useChatStore.getState().messages).toEqual([otro]);
});

test("enviar, borrar y silenciar mandan el comando al servidor", () => {
  useChatStore.getState().send("hola");
  useChatStore.getState().remove("a1");
  useChatStore.getState().askMute({ id: 2, dname: "Beto" });
  expect(useChatStore.getState().muting).toEqual({ id: 2, dname: "Beto" }); // abre el modal
  useChatStore.getState().mute(24 * 60, "spam");
  expect(useChatStore.getState().muting).toBeNull(); // y lo cierra
  expect(sent).toEqual([
    { type: "send", text: "hola" },
    { type: "delete", id: "a1" },
    { type: "mute", userId: 2, minutes: 24 * 60, reason: "spam" },
  ]);
});

test("los errores del servidor se muestran y se quitan solos a los 5 s", () => {
  vi.useFakeTimers();
  receive({
    type: "error",
    ok: false,
    code: 429,
    message: "Espera un momento antes de mandar otro mensaje",
    error: "TOO_FAST",
  });
  expect(useChatStore.getState().notice).toBe("Espera un momento antes de mandar otro mensaje");
  vi.advanceTimersByTime(5_000);
  expect(useChatStore.getState().notice).toBeNull();
  vi.useRealTimers();
});

test("si se cae la conexión deja de estar conectado", () => {
  receive({ type: "history", messages: [], mod: true });
  drop();
  expect(useChatStore.getState().connected).toBe(false);
});

test("si el servidor dice SESSION_EXPIRED, se cierra la sesión", () => {
  useAuthStore.setState({ session: testSession });
  receive({ type: "error", ok: false, code: 401, message: "x", error: "SESSION_EXPIRED" });
  expect(useAuthStore.getState().session).toBeNull();
});

const dmFromBeto = {
  id: "d1",
  from: { id: 2, dname: "Beto" },
  to: { id: 1, dname: "Ana" },
  text: "¿jugamos?",
  at: "2026-01-01T12:00:00Z",
};

test("con una conversación abierta, escribir manda un privado; los que llegan se agregan y se marcan leídos", async () => {
  await useChatStore.getState().openThread({ id: 2, dname: "Beto" });
  expect(useChatStore.getState()).toMatchObject({ view: "dms", thread: { id: 2, dname: "Beto" } });
  expect(useChatStore.getState().conversations).toEqual(conversations);

  useChatStore.getState().send("¡va!");
  expect(sent).toEqual([{ type: "dm", to: 2, text: "¡va!" }]);

  receive({ type: "dm", message: dmFromBeto });
  expect(useChatStore.getState().threadMessages).toEqual([dmFromBeto]);
  expect(markRead).toHaveBeenCalledWith(2);
});

test("sin conversación abierta, escribir va al global", () => {
  useChatStore.getState().send("hola a todos");
  expect(sent).toEqual([{ type: "send", text: "hola a todos" }]);
});

test("una mención en el global mientras ves los privados enciende el aviso; al volver se apaga", () => {
  useChatStore.getState().setView("dms");
  receive({ type: "message", message: { ...hola, id: "a3", text: "@ana ¿vienes?" } });
  expect(useChatStore.getState().mentioned).toBe(true);
  useChatStore.getState().setView("global");
  expect(useChatStore.getState().mentioned).toBe(false);
});

test("menciones: @nombre completo, sin importar mayúsculas", () => {
  expect(mentions("hola @Ana", "Ana")).toBe(true);
  expect(mentions("@ana!", "Ana")).toBe(true);
  expect(mentions("hola @Anabel", "Ana")).toBe(false);
  expect(mentions("correo@ana", "Ana")).toBe(false);
});
