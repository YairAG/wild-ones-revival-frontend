import { beforeEach, expect, test, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/store";
import { useModerationStore } from "./store";

const summary = {
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

// Backend de cuentas simulado: cada llamada responde con la siguiente respuesta de la lista
function mockBackend(...responses: [number, object | null][]) {
  const fetchMock = vi.fn();
  for (const [status, body] of responses) {
    fetchMock.mockResolvedValueOnce({ ok: status < 400, status, json: async () => body });
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  useAuthStore.setState({ session: { id: 1, dname: "Ana", token: "jwt" } });
  useModerationStore.setState({ open: false, summary: null, error: null });
});

test("al abrir carga silenciados y registro con el token de la sesión", async () => {
  const fetchMock = mockBackend([200, summary]);
  useModerationStore.getState().show();
  expect(useModerationStore.getState().open).toBe(true);
  await vi.waitFor(() => expect(useModerationStore.getState().summary).toEqual(summary));
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/chat\/moderation$/);
  expect(options.headers.authorization).toBe("Bearer jwt");
});

test("quitar silencio usa DELETE y recarga", async () => {
  const fetchMock = mockBackend([204, null], [200, { ...summary, muted: [] }]);
  await useModerationStore.getState().unmute(2);
  expect(fetchMock.mock.calls[0][0]).toMatch(/\/chat\/mutes\/2$/);
  expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  expect(useModerationStore.getState().summary?.muted).toEqual([]);
});

test("si no eres moderador se muestra el error del backend", async () => {
  mockBackend([403, { error: "Solo los moderadores pueden hacer eso" }]);
  await useModerationStore.getState().load();
  expect(useModerationStore.getState().error).toBe("Solo los moderadores pueden hacer eso");
});
