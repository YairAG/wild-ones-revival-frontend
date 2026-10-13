// Detalles que comparten el chat global y los privados.

// Ref de callback: el último mensaje se hace visible al aparecer, así la lista baja sola cuando llega uno nuevo
export function scrollIntoView(element: HTMLElement | null) {
  element?.scrollIntoView({ block: "nearest" });
}

// "19:23"
export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
