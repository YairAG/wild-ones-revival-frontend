// Dibujos de mascotas para la web (perfil, cabecera). Se los pide a un reproductor aparte en modo retrato (ver
// services/pet-renderer.ts): el SWF las arma con su ropa y colores (la misma clase que usa en partida) y responde
// con los píxeles por window.wildRevivalPet. Cada mascota se pide una sola vez por tamaño, y se guarda en este
// navegador (cache.ts): si ya estaba, ni siquiera se crea el reproductor de retratos.
import { create } from "zustand";
import { cachedPetImages, cachePetImage } from "./cache";
import { pixelsToDataUrl } from "./pixels";
import { petRenderer } from "./services/pet-renderer";
import type { PetLook } from "./types";

type PetImagesState = {
  images: Record<string, string | null>; // por clave (ver petKey); null: el juego no la pudo dibujar
  request(pet: PetLook, size: number): void;
};

/** La misma mascota (especie, colores y ropa) al mismo tamaño tiene la misma clave */
export const petKey = (pet: PetLook, size: number) =>
  JSON.stringify([pet.type, String(pet.color1), String(pet.color2), pet.accessories, size]);

// Pedidas que todavía no responde el reproductor de retratos, y cuáles ya se le mandaron
const waiting = new Map<string, { pet: PetLook; size: number }>();
const sent = new Set<string>();
let retry: ReturnType<typeof setTimeout> | undefined;

// Manda al reproductor lo pendiente. requestPet aparece cuando el SWF termina de arrancar: mientras, se reintenta
async function send() {
  clearTimeout(retry);
  const player = await petRenderer();
  if (!player.requestPet) {
    retry = setTimeout(() => void send(), 1000);
    return;
  }
  for (const [key, { pet, size }] of waiting) {
    if (sent.has(key)) continue;
    sent.add(key);
    player.requestPet(key, pet, size);
  }
}

export const usePetImagesStore = create<PetImagesState>((set, get) => ({
  images: cachedPetImages(),
  request(pet, size) {
    const key = petKey(pet, size);
    if (key in get().images || waiting.has(key)) return;
    waiting.set(key, { pet, size });
    void send();
  },
}));

// La respuesta del SWF (ver PET_RENDERER en scripts/build-swf.ts)
declare global {
  interface Window {
    wildRevivalPet?: (key: string, pixels: number[] | null) => void;
  }
}
if (typeof window !== "undefined") {
  window.wildRevivalPet = (key, pixels) => {
    const request = waiting.get(key);
    if (!request) return;
    waiting.delete(key);
    const image = pixels ? pixelsToDataUrl(pixels, request.size) : null;
    if (image) cachePetImage(key, image); // las que no se pudieron dibujar no se guardan: se reintentan
    usePetImagesStore.setState((s) => ({ images: { ...s.images, [key]: image } }));
  };
}
