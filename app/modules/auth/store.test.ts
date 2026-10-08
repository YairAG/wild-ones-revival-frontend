import { beforeEach, expect, test, vi } from "vitest";
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
  mockBackend(200, { id: 1, dname: "Ana", token: "jwt" });
  expect(await useAuthStore.getState().submit("Ana", "clave-segura")).toBe(true);
  expect(useAuthStore.getState().session).toEqual({ id: 1, dname: "Ana", token: "jwt" });
  expect(vi.mocked(fetch).mock.calls[0][0]).toMatch(/\/login$/);
});

test("en modo registro llama a /register", async () => {
  mockBackend(201, { id: 2, dname: "Beto", token: "jwt" });
  useAuthStore.getState().toggleMode();
  await useAuthStore.getState().submit("Beto", "clave-segura");
  expect(vi.mocked(fetch).mock.calls[0][0]).toMatch(/\/register$/);
});

test("un error del backend se muestra y no hay sesión", async () => {
  mockBackend(401, { error: "Nombre o contraseña incorrectos" });
  expect(await useAuthStore.getState().submit("Ana", "mala-clave")).toBe(false);
  expect(useAuthStore.getState().error).toBe("Nombre o contraseña incorrectos");
  expect(useAuthStore.getState().session).toBeNull();
});

test("salir borra la sesión y vuelve el formulario a 'entrar'", () => {
  useAuthStore.setState({
    session: { id: 1, dname: "Ana", token: "jwt" },
    mode: "register",
    error: "x",
  });
  useAuthStore.getState().logout();
  const { session, mode, error } = useAuthStore.getState();
  expect({ session, mode, error }).toEqual({ session: null, mode: "login", error: null });
});
