import { beforeEach, expect, test, vi } from "vitest";
import { testSession } from "./helpers/test-session";
import { useAuthStore } from "./store";

// Backend de cuentas simulado: responde lo que le digamos
function mockBackend(status: number, body: object) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: status < 400, json: async () => body })),
  );
}

beforeEach(() =>
  useAuthStore.setState({ session: null, mode: "login", error: null, loading: false }),
);

test("entrar guarda la sesión", async () => {
  mockBackend(200, {
    ok: true,
    code: 200,
    message: "Sesión iniciada",
    data: { id: 1, dname: "Ana", token: "jwt" },
  });
  expect(await useAuthStore.getState().submit("Ana", "clave-segura")).toBe(true);
  expect(useAuthStore.getState().session).toEqual({ id: 1, dname: "Ana", token: "jwt" });
  expect(vi.mocked(fetch).mock.calls[0][0]).toMatch(/\/login$/);
});

test("en modo registro llama a /register", async () => {
  mockBackend(201, {
    ok: true,
    code: 201,
    message: "Cuenta creada",
    data: { id: 2, dname: "Beto", token: "jwt" },
  });
  useAuthStore.getState().toggleMode();
  const signup = { email: "beto@example.com", acceptTerms: true };
  await useAuthStore.getState().submit("Beto", "clave-segura", signup);
  const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
  expect(url).toMatch(/\/register$/);
  expect(JSON.parse(init.body as string)).toEqual({
    dname: "Beto",
    password: "clave-segura",
    ...signup,
  });
});

test("un error del backend se muestra y no hay sesión", async () => {
  mockBackend(401, {
    ok: false,
    code: 401,
    message: "Nombre o contraseña incorrectos",
    error: "WRONG_CREDENTIALS",
  });
  expect(await useAuthStore.getState().submit("Ana", "mala-clave")).toBe(false);
  expect(useAuthStore.getState().error).toBe("Nombre o contraseña incorrectos");
  expect(useAuthStore.getState().session).toBeNull();
});

test("salir cierra la sesión en el backend (borra la cookie) y vuelve el formulario a 'entrar'", async () => {
  mockBackend(200, { ok: true, code: 200, message: "Sesión cerrada" });
  useAuthStore.setState({ session: testSession, mode: "register", error: "x" });
  await useAuthStore.getState().logout();
  expect(vi.mocked(fetch).mock.calls[0][0]).toMatch(/\/logout$/);
  const { session, mode, error } = useAuthStore.getState();
  expect({ session, mode, error }).toEqual({ session: null, mode: "login", error: null });
});

test("al abrir la página recupera la sesión con la cookie (/refresh)", async () => {
  mockBackend(200, { ok: true, code: 200, message: "Sesión renovada", data: testSession });
  expect(await useAuthStore.getState().restore()).toBe(true);
  expect(useAuthStore.getState().session).toEqual(testSession);
  expect(vi.mocked(fetch).mock.calls[0][0]).toMatch(/\/refresh$/);
});

test("sin cookie vigente no hay sesión, y tampoco aviso (nunca había entrado)", async () => {
  mockBackend(401, { ok: false, code: 401, message: "x", error: "SESSION_EXPIRED" });
  expect(await useAuthStore.getState().restore()).toBe(false);
  expect(useAuthStore.getState().error).toBeNull();
});

test("varias renovaciones a la vez comparten una sola petición", async () => {
  mockBackend(200, { ok: true, code: 200, message: "Sesión renovada", data: testSession });
  const tokens = await Promise.all([1, 2, 3].map(() => useAuthStore.getState().freshToken()));
  expect(tokens).toEqual([testSession.token, testSession.token, testSession.token]);
  expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
});
