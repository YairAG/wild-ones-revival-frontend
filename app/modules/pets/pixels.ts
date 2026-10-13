// Píxeles que manda el SWF (ARGB, uno por número, sin premultiplicar) → imagen PNG como data URL.
export function pixelsToDataUrl(pixels: number[], size: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(size, size);
  pixels.forEach((argb, i) => {
    image.data[i * 4] = (argb >>> 16) & 255; // rojo
    image.data[i * 4 + 1] = (argb >>> 8) & 255; // verde
    image.data[i * 4 + 2] = argb & 255; // azul
    image.data[i * 4 + 3] = argb >>> 24; // alfa
  });
  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
