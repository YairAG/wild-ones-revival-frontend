// Quita acentos, diéresis, la tilde de la ñ y los signos ¿ ¡: las fuentes del juego no traen esas letras y,
// si se agregan, salen de otra fuente y se notan. Los diccionarios guardan el español correcto.
export const withoutAccents = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿¡]/g, "");
