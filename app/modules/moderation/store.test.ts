import { beforeEach, expect, test, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/store";
import { testSession } from "@/modules/auth/helpers/test-session";
import { useModerationStore } from "./store";

const summary = {
  reports: [],
  muted: [{ id: 2, dname: "Beto", until: "2026-01-01T13:00:00Z" }],
  log: [
    {
      at: "2026-01-01T12:00:00Z",
      mod: { id: 1, dname: "Ana" },
      action: "mute",
      target: { id: 2, dname: "Beto" },
      minutes: 60,
    },
  ],
};

// Backend de cuentas simulado: cada llamada responde con la siguiente de la lista, con el formato del backend.
// Bien: [código, data?]. Error: [código, { message, error }]
function mockBackend(...responses: [number, object?][]) {
  const fetchMock = vi.fn();
  for (const [code, payload] of responses) {
    const body =
      code < 400
        ? { ok: true, code, message: "Listo", data: payload }
        : { ok: false, code, ...payload };
    fetchMock.mockResolvedValueOnce({ ok: code < 400, status: code, json: async () => body });
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  useAuthStore.setState({ session: testSession });
  useModerationStore.setState({ open: false, summary: null, error: null });
});

test("al abrir carga silenciados y registro con el token de la sesión", async () => {
  const fetchMock = mockBackend([200, summary]);
  useModerationStore.getState().show();
  expect(useModerationStore.getState().open).toBe(true);
  await vi.waitFor(() => expect(useModerationStore.getState().summary).toEqual(summary));
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/chat\/moderation$/);
  expect(options.headers.authorization).toBe(`Bearer ${testSession.token}`);
});

test("quitar silencio usa DELETE y recarga", async () => {
  const fetchMock = mockBackend([200], [200, { ...summary, muted: [] }]);
  await useModerationStore.getState().unmute(2);
  expect(fetchMock.mock.calls[0][0]).toMatch(/\/chat\/mutes\/2$/);
  expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  expect(useModerationStore.getState().summary?.muted).toEqual([]);
});

test("si no eres moderador se muestra el error del backend", async () => {
  mockBackend([403, { message: "Solo los moderadores pueden hacer eso", error: "NOT_MOD" }]);
  await useModerationStore.getState().load();
  expect(useModerationStore.getState().error).toBe("Solo los moderadores pueden hacer eso");
});

test("resolver un reporte usa POST /reports/:id/resolve y recarga", async () => {
  const fetchMock = mockBackend([200], [200, summary]);
  await useModerationStore.getState().resolve("r1");
  expect(fetchMock.mock.calls[0][0]).toMatch(/\/reports\/r1\/resolve$/);
  expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  expect(useModerationStore.getState().summary).toEqual(summary);
});
