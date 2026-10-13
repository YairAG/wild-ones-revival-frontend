// La mascota dibujada por el juego, con su ropa y colores. Mientras llega (o si el juego no la pudo dibujar) se
// ve `fallback` (p. ej. las iniciales).
import type { ReactNode } from "react";
import { petKey, usePetImagesStore } from "../store";
import type { PetLook } from "../types";

// Se pide al doble de tamaño para que se vea nítida en pantallas de alta densidad
const SCALE = 2;

// Ref de callback fuera del componente (siempre la misma): al aparecer, pide el dibujo con los datos que lleva
// el elemento (data-pet y data-size)
function requestOnMount(element: HTMLElement | null) {
  if (!element?.dataset.pet) return;
  usePetImagesStore
    .getState()
    .request(JSON.parse(element.dataset.pet), Number(element.dataset.size));
}

type Props = { pet: PetLook | undefined; size: number; fallback: ReactNode; className?: string };

export function PetAvatar({ pet, size, fallback, className = "" }: Props) {
  const image = usePetImagesStore((s) => (pet ? s.images[petKey(pet, size * SCALE)] : null));
  return (
    <span
      // key: si cambia la mascota, el elemento es otro y la ref vuelve a pedir
      key={pet ? petKey(pet, size) : "sin-mascota"}
      ref={requestOnMount}
      data-pet={pet ? JSON.stringify(pet) : undefined}
      data-size={size * SCALE}
      className={`flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {image ? <img src={image} alt={pet?.name ?? ""} width={size} height={size} /> : fallback}
    </span>
  );
}
