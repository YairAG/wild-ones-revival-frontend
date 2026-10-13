import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { NAME_CHECK_DELAY_MS, useRegisterStore } from "./register-store";

// Backend simulado: los nombres de `taken` están ocupados
function mockBackend(taken: string[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const dname = new URL(url, "http://x").searchParams.get("dname")!;
      const available = !taken.includes(dname.toLowerCase());
      return {
        ok: true,
        json: async () => ({ ok: true, code: 200, message: "", data: { available } }),
      };
    }),
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  useRegisterStore.getState().reset();
});
afterEach(() => vi.useRealTimers());

const status = () => useRegisterStore.getState().name.status;

test("formato inválido o corto: se dice sin preguntar al backend", () => {
  mockBackend([]);
  useRegisterStore.getState().checkName("con espacio");
  expect(status()).toBe("invalid");
  useRegisterStore.getState().checkName("ab");
  expect(status()).toBe("idle");
  useRegisterStore.getState().checkName("a".repeat(17));
  expect(status()).toBe("invalid");
  expect(fetch).not.toHaveBeenCalled();
});

test("pregunta un rato después de la última tecla, una sola vez", async () => {
  mockBackend(["ana"]);
  useRegisterStore.getState().checkName("An");
  useRegisterStore.getState().checkName("Ana");
  expect(status()).toBe("checking");
  await vi.advanceTimersByTimeAsync(NAME_CHECK_DELAY_MS);
  expect(status()).toBe("taken");
  expect(fetch).toHaveBeenCalledTimes(1);

  useRegisterStore.getState().checkName("Zoe_99");
  await vi.advanceTimersByTimeAsync(NAME_CHECK_DELAY_MS);
  expect(useRegisterStore.getState().name).toEqual({ status: "available", message: "Disponible." });
});

test("si el backend no responde, vuelve a la ayuda", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Promise.reject(new Error("sin red"))),
  );
  useRegisterStore.getState().checkName("Ana");
  await vi.advanceTimersByTimeAsync(NAME_CHECK_DELAY_MS);
  expect(status()).toBe("idle");
});

test("medidor de contraseña", () => {
  useRegisterStore.getState().setPassword("Abcdefg1!");
  expect(useRegisterStore.getState().strength).toEqual({ score: 4, label: "Muy buena" });
});
