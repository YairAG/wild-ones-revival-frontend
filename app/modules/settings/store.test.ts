import { beforeEach, expect, test, vi } from "vitest";
import { testSession } from "@/modules/auth/helpers/test-session";
import { useAuthStore } from "@/modules/auth/store";
import { useSettingsStore } from "./store";

// Backend simulado: responde lo que le digamos y guarda qué se pidió
function mockBackend(body: object) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
const done = (message: string) => ({ ok: true, code: 200, message });

beforeEach(() => {
  useAuthStore.setState({ session: testSession, error: null });
  useSettingsStore.setState({ open: true, notice: null });
});

test("cambiar una preferencia la aplica al momento", () => {
  useSettingsStore.getState().setPreference("volume", 40);
  useSettingsStore.getState().setPreference("showChatTime", false);
  expect(useSettingsStore.getState().preferences).toMatchObject({
    volume: 40,
    showChatTime: false,
  });
});

test("cambiar contraseña manda la actual y la nueva y muestra la respuesta", async () => {
  const fetchMock = mockBackend(done("Contraseña cambiada. Se cerraron tus otras sesiones"));
  expect(await useSettingsStore.getState().changePassword("vieja-123", "nueva-456")).toBe(true);
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/account\/password$/);
  expect(JSON.parse(options.body)).toEqual({ current: "vieja-123", next: "nueva-456" });
  expect(useSettingsStore.getState().notice).toEqual({
    ok: true,
    text: "Contraseña cambiada. Se cerraron tus otras sesiones",
  });
});

test("con la contraseña equivocada muestra el error y no elimina nada", async () => {
  mockBackend({
    ok: false,
    code: 403,
    message: "La contraseña no es correcta",
    error: "WRONG_PASSWORD",
  });
  await useSettingsStore.getState().deleteAccount("mala");
  expect(useSettingsStore.getState().notice).toEqual({
    ok: false,
    text: "La contraseña no es correcta",
  });
  expect(useAuthStore.getState().session).toEqual(testSession);
});

test("eliminar la cuenta cierra los ajustes y la sesión", async () => {
  const fetchMock = mockBackend(done("Cuenta eliminada"));
  await useSettingsStore.getState().deleteAccount("buena-123");
  expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  expect(useSettingsStore.getState().open).toBe(false);
  expect(useAuthStore.getState().session).toBeNull();
});
