import { beforeEach, expect, test, vi } from "vitest";
import { testSession } from "@/modules/auth/helpers/test-session";
import { useAuthStore } from "@/modules/auth/store";
import { useProfileStore } from "./store";
import type { PlayerProfile } from "./types";

const beto: PlayerProfile = {
  id: 2,
  dname: "Beto",
  level: 3,
  wins: 7,
  losses: 2,
  gamecount: 9,
  presence: "lobby",
  pets: [
    {
      name: "Bolita",
      type: "dog",
      gender: "M",
      color1: 7105644,
      color2: 14803683,
      accessories: [],
      current: true,
    },
  ],
  mutualFriends: 1,
  relation: "none",
  blocked: false,
};
const emptyFriends = { friends: [], incoming: [], outgoing: [], blocked: [] };

// Backend simulado: responde según la ruta, con el formato del backend; guarda qué se pidió
let calls: { url: string; method: string; body?: unknown }[] = [];
function mockBackend(routes: Record<string, object | undefined>) {
  calls = [];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    calls.push({
      url: path,
      method: init.method!,
      body: init.body && JSON.parse(String(init.body)),
    });
    const data = routes[`${init.method} ${path}`];
    return { ok: true, json: async () => ({ ok: true, code: 200, message: "Listo", data }) };
  });
}
const flush = () => new Promise((resolve) => setTimeout(resolve));

beforeEach(() => {
  useAuthStore.setState({ session: testSession });
  mockBackend({ "GET /players/2": beto, "GET /friends": emptyFriends });
});

test("abrir el perfil lo carga", async () => {
  useProfileStore.getState().show(2);
  expect(useProfileStore.getState().profile).toBeNull(); // cargando
  await flush();
  expect(useProfileStore.getState().profile).toEqual(beto);
  expect(useProfileStore.getState().step).toBe("profile");
});

test("bloquear usa POST /blocks/:id, muestra la respuesta y recarga", async () => {
  useProfileStore.getState().show(2);
  await flush();
  await useProfileStore.getState().toggleBlock();
  expect(calls.some((c) => c.method === "POST" && c.url === "/blocks/2")).toBe(true);
  expect(useProfileStore.getState().notice).toBe("Listo");
});

test("reportar desde un mensaje lo adjunta; con 'bloquear también' además lo bloquea", async () => {
  const message = { id: "m1", text: "hola", at: "2026-01-01T12:00:00Z" };
  useProfileStore.getState().show(2, message);
  await flush();
  useProfileStore.getState().setStep("report");
  await useProfileStore.getState().report("spam", "mucho spam", true);

  const report = calls.find((c) => c.url === "/reports");
  expect(report?.body).toEqual({
    targetId: 2,
    reason: "spam",
    details: "mucho spam",
    messageId: "m1",
  });
  expect(calls.some((c) => c.method === "POST" && c.url === "/blocks/2")).toBe(true);
  expect(useProfileStore.getState().step).toBe("sent");
});
