import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/store";
import { useFriendsStore } from "./store";

const list = {
  friends: [{ id: 2, dname: "Beto", level: 3, presence: "lobby" }],
  incoming: [{ id: 3, dname: "Caro" }],
  outgoing: [],
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
  useFriendsStore.setState({ list: { friends: [], incoming: [], outgoing: [] }, error: null });
});
afterEach(() => vi.useRealTimers());

test("cargar trae la lista con el token de la sesión", async () => {
  const fetchMock = mockBackend([200, list]);
  await useFriendsStore.getState().load();
  expect(useFriendsStore.getState().list).toEqual(list);
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/friends$/);
  expect(options.headers.authorization).toBe("Bearer jwt");
});

test("agregar envía el nombre y recarga la lista", async () => {
  const fetchMock = mockBackend([201, { status: "pending" }], [200, list]);
  expect(await useFriendsStore.getState().send("Beto")).toBe(true);
  expect(fetchMock.mock.calls[0][0]).toMatch(/\/friends\/requests$/);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ dname: "Beto" });
  expect(useFriendsStore.getState().list).toEqual(list);
});

test("un error del backend se muestra y no recarga", async () => {
  const fetchMock = mockBackend([404, { error: "No existe un jugador con ese nombre" }]);
  expect(await useFriendsStore.getState().send("Nadie")).toBe(false);
  expect(useFriendsStore.getState().error).toBe("No existe un jugador con ese nombre");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("rechazar usa DELETE (responde 204, sin cuerpo)", async () => {
  const fetchMock = mockBackend([204, null], [200, list]);
  await useFriendsStore.getState().dismiss(3);
  expect(fetchMock.mock.calls[0][0]).toMatch(/\/friends\/requests\/3$/);
  expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  expect(useFriendsStore.getState().error).toBeNull();
});

test("mientras el panel está en pantalla recarga cada 15 s, y para al quitarlo", async () => {
  vi.useFakeTimers();
  const fetchMock = mockBackend([200, list], [200, list], [200, list]);
  const stop = useFriendsStore.getState().startRefreshing();
  expect(fetchMock).toHaveBeenCalledTimes(1); // al montar
  await vi.advanceTimersByTimeAsync(15_000);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  stop();
  await vi.advanceTimersByTimeAsync(60_000);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
