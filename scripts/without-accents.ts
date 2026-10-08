// Quita acentos, diéresis, la tilde de la ñ y los signos ¿ ¡: las fuentes del juego no traen esas letras y,
// si se agregan, salen de otra fuente y se notan. Los diccionarios guardan el español correcto.
// NFD separa cada letra de su marca ("á" → "a" + acento) y \p{M} son esas marcas.
export const withoutAccents = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").replace(/[¿¡]/g, "");
