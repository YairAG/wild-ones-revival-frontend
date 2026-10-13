import { beforeEach, expect, test, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/store";
import { accountsRequest, ApiError } from "./accounts-request";

beforeEach(() => useAuthStore.setState({ session: null }));

test("devuelve la respuesta completa y manda el token solo si hay sesión", async () => {
  const body = { ok: true, code: 200, message: "Lista de amigos", data: { friends: [] } };
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
  vi.stubGlobal("fetch", fetchMock);

  expect(await accountsRequest("GET", "/friends")).toEqual(body);
  expect(fetchMock.mock.calls[0][1].headers).toEqual({});

  useAuthStore.setState({ session: { id: 1, dname: "Ana", token: "jwt" } });
  await accountsRequest("GET", "/friends");
  expect(fetchMock.mock.calls[1][1].headers).toEqual({ authorization: "Bearer jwt" });
});

test("un error del backend se lanza como ApiError con message, error y code", async () => {
  const body = { ok: false, code: 401, message: "Tu sesión expiró", error: "SESSION_EXPIRED" };
  vi.stubGlobal("fetch", async () => ({ ok: false, json: async () => body }));

  const error = await accountsRequest("GET", "/friends").catch((e) => e);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ message: "Tu sesión expiró", error: "SESSION_EXPIRED", code: 401 });
});

test("SESSION_EXPIRED cierra la sesión y deja el aviso para el login", async () => {
  useAuthStore.setState({ session: { id: 1, dname: "Ana", token: "jwt" } });
  const body = { ok: false, code: 401, message: "x", error: "SESSION_EXPIRED" };
  vi.stubGlobal("fetch", async () => ({ ok: false, json: async () => body }));
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
