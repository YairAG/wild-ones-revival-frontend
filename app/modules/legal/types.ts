/** Una página legal (reglas, términos, privacidad): título, fecha y secciones con párrafos y/o listas */
export type LegalDoc = {
  path: "/reglas" | "/terminos" | "/privacidad";
  title: string;
  updated: string; // "12 de octubre de 2026"
  intro: string;
  sections: LegalSection[];
};

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};
