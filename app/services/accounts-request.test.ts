import { beforeEach, expect, test, vi } from "vitest";
import { testSession } from "@/modules/auth/helpers/test-session";
import { useAuthStore } from "@/modules/auth/store";
import { accountsRequest, ApiError } from "./accounts-request";

// fetch simulado: cada llamada responde el siguiente body de la lista
function mockFetch(...bodies: Record<string, unknown>[]) {
  const fetchMock = vi.fn();
  for (const body of bodies) {
    fetchMock.mockResolvedValueOnce({ ok: body.ok, json: async () => body });
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
const done = (data?: object) => ({ ok: true, code: 200, message: "Listo", data });

beforeEach(() => useAuthStore.setState({ session: testSession, error: null }));

test("con sesión manda el token y siempre credentials: include (para la cookie)", async () => {
  const fetchMock = mockFetch(done({ friends: [] }));
  expect(await accountsRequest("GET", "/friends")).toEqual(done({ friends: [] }));
  const [, options] = fetchMock.mock.calls[0];
  expect(options.headers).toEqual({ authorization: `Bearer ${testSession.token}` });
  expect(options.credentials).toBe("include");
});

test("auth: false no manda token (login, registro, refresh)", async () => {
  const fetchMock = mockFetch(done());
  await accountsRequest("POST", "/login", { dname: "Ana" }, { auth: false });
  expect(fetchMock.mock.calls[0][1].headers.authorization).toBeUndefined();
});

test("si el token de acceso venció, primero se renueva con /refresh y la petición va con el nuevo", async () => {
  const expired = `x.${btoa(JSON.stringify({ exp: 1 }))}.firma`;
  useAuthStore.setState({ session: { ...testSession, token: expired } });
  const renewed = { ...testSession, token: testSession.token + "2" };
  const fetchMock = mockFetch(done(renewed), done({ friends: [] }));

  await accountsRequest("GET", "/friends");
  expect(fetchMock.mock.calls[0][0]).toMatch(/\/refresh$/);
  expect(fetchMock.mock.calls[1][1].headers.authorization).toBe(`Bearer ${renewed.token}`);
  expect(useAuthStore.getState().session).toEqual(renewed);
});

test("un error del backend se lanza como ApiError con message, error y code", async () => {
  mockFetch({ ok: false, code: 409, message: "Ya son amigos", error: "ALREADY_FRIENDS" });
  const error = await accountsRequest("POST", "/friends/requests").catch((e) => e);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ message: "Ya son amigos", error: "ALREADY_FRIENDS", code: 409 });
});

test("SESSION_EXPIRED con sesión: se cierra y el login lo explica", async () => {
  mockFetch({ ok: false, code: 401, message: "x", error: "SESSION_EXPIRED" });
  await accountsRequest("GET", "/friends").catch(() => {});
  expect(useAuthStore.getState().session).toBeNull();
  expect(useAuthStore.getState().error).toBe("Tu sesión expiró, vuelve a entrar");
});

test("si no hay conexión con el servidor, NETWORK_ERROR", async () => {
  vi.stubGlobal("fetch", async () => {
    throw new TypeError("Failed to fetch");
  });
  await expect(accountsRequest("GET", "/friends")).rejects.toMatchObject({
    message: "No se pudo conectar con el servidor",
    error: "NETWORK_ERROR",
  });
});
