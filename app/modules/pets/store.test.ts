import { beforeEach, expect, test, vi } from "vitest";
import type { RufflePlayerElement } from "@/modules/game/types";
import type { PetLook } from "./types";

// Sin navegador no hay canvas: la imagen es un texto que dice de qué píxeles salió
vi.mock("./pixels", () => ({
  pixelsToDataUrl: (pixels: number[]) => `imagen:${pixels.join(",")}`,
}));

// Reproductor de retratos simulado: guarda lo que se le pide. Empieza sin requestPet (el SWF no ha arrancado)
const asked: [string, object, number][] = [];
const renderer = {} as RufflePlayerElement;
const ready = () => {
  renderer.requestPet = (id, pet, size) => void asked.push([id, pet, size]);
};
vi.mock("./services/pet-renderer", () => ({ petRenderer: async () => renderer }));

// La store registra window.wildRevivalPet (la respuesta del SWF); en Node no hay window
vi.stubGlobal("window", globalThis);
const { petKey, usePetImagesStore } = await import("./store");

const mono: PetLook = {
  name: "Peter",
  type: "monkey",
  gender: "M",
  color1: 7105644,
  color2: "0xE1E2E3",
  accessories: ["top_samurai"],
};
const flush = () => new Promise((resolve) => setTimeout(resolve));

beforeEach(() => {
  asked.length = 0;
  usePetImagesStore.setState({ images: {} });
});

test("si el SWF todavía no arranca, reintenta; luego pide una sola vez y guarda la imagen", async () => {
  vi.useFakeTimers();
  usePetImagesStore.getState().request(mono, 64);
  await vi.advanceTimersByTimeAsync(0);
  expect(asked).toEqual([]); // sin requestPet todavía

  ready();
  await vi.advanceTimersByTimeAsync(1000);
  usePetImagesStore.getState().request(mono, 64); // repetida: no se vuelve a pedir
  await vi.advanceTimersByTimeAsync(0);
  expect(asked).toEqual([[petKey(mono, 64), mono, 64]]);
  vi.useRealTimers();

  window.wildRevivalPet!(petKey(mono, 64), [0xff000000, 0]);
  expect(usePetImagesStore.getState().images[petKey(mono, 64)]).toBe(`imagen:${0xff000000},0`);
});

test("si el juego no la pudo dibujar queda null (se ve el reemplazo)", async () => {
  const perro = { ...mono, type: "dog" };
  usePetImagesStore.getState().request(perro, 64);
  await flush();
  window.wildRevivalPet!(petKey(perro, 64), null);
  expect(usePetImagesStore.getState().images[petKey(perro, 64)]).toBeNull();
});
