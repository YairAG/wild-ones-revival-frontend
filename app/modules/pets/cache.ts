// Caché de los dibujos de mascotas en este navegador (localStorage): así no se vuelven a dibujar en cada visita,
// solo cuando la mascota cambia (otra ropa o colores dan otra clave). Si no se puede leer o guardar, sigue sin
// caché.

// Subir la versión cuando cambie cómo se dibujan (p. ej. un arreglo en el SWF): las guardadas dejan de servir
const CACHE_KEY = "wildrevival-pets-v2";
const MAX_IMAGES = 100; // las más viejas se borran: cada una pesa unos pocos KB

export function cachedPetImages(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Guarda la imagen como la más nueva (el orden de las claves es el de llegada) y borra las que sobren */
export function cachePetImage(key: string, image: string): void {
  try {
    const images = cachedPetImages();
    delete images[key];
    images[key] = image;
    const keys = Object.keys(images);
    for (const old of keys.slice(0, Math.max(0, keys.length - MAX_IMAGES))) delete images[old];
    localStorage.setItem(CACHE_KEY, JSON.stringify(images));
  } catch {
    // sin espacio o sin acceso: se queda solo en memoria
  }
}
