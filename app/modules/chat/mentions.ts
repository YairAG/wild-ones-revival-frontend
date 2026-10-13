// Menciones en el chat global: "@Ana" menciona a Ana (sin importar mayúsculas).

/** ¿El texto menciona a `dname`? (los nombres solo tienen letras, números y _, así que van tal cual al patrón) */
export const mentions = (text: string, dname: string) =>
  new RegExp(`(^|[^\\w])@${dname}(?!\\w)`, "i").test(text);
