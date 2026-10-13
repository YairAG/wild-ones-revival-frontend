import { beforeEach, expect, test, vi } from "vitest";
import { cachedPetImages, cachePetImage } from "./cache";

// localStorage simulado (en Node no hay)
let stored: Record<string, string> = {};
beforeEach(() => {
  stored = {};
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => stored[key] ?? null,
    setItem: (key: string, value: string) => void (stored[key] = value),
  });
});

test("guarda las imágenes y las devuelve en la siguiente visita", () => {
  cachePetImage("mono", "data:mono");
  cachePetImage("perro", "data:perro");
  expect(cachedPetImages()).toEqual({ mono: "data:mono", perro: "data:perro" });
});

test("guarda solo las últimas 100: borra las más viejas (usar una la vuelve la más nueva)", () => {
  for (let i = 0; i < 100; i++) cachePetImage(`m${i}`, `data:${i}`);
  cachePetImage("m0", "data:0"); // m0 se vuelve la más nueva
  cachePetImage("nueva", "data:nueva"); // sobra una: se va m1, la más vieja
  const images = cachedPetImages();
  expect(Object.keys(images)).toHaveLength(100);
  expect(images.m1).toBeUndefined();
  expect(images.m0).toBe("data:0");
  expect(images.nueva).toBe("data:nueva");
});

test("sin localStorage (o lleno) sigue funcionando, sin caché", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("bloqueado");
    },
    setItem: () => {
      throw new Error("lleno");
    },
  });
  expect(() => cachePetImage("mono", "data:mono")).not.toThrow();
  expect(cachedPetImages()).toEqual({});
});
