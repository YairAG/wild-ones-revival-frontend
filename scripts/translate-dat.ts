// Traduce los textos de los .dat del juego con un diccionario inglés → español.
//   node scripts/translate-dat.ts
// Lee los originales de public/game/original-json/ y escribe los traducidos en public/game/assets/json/.
// El diccionario (public/game/translations/es.json) es local, como el resto de public/game/: tiene textos de
// Playdom/Disney. Los textos que aún no estén en él se agregan vacíos ("") para traducirlos, y mientras
// se dejan en inglés.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

const ORIGINALS = "public/game/original-json";
const OUTPUT = "public/game/assets/json";
const DICTIONARY = "public/game/translations/es.json";

// Campos con texto visible, por archivo. No se tocan los que el servidor usa como clave (p. ej. Maps "name")
const FIELDS: Record<string, string[]> = {
  "Accessories.dat": ["alt", "tip"],
  "WeaponsGrid.dat": ["alt", "tip"],
  "Gifts.dat": ["name", "tip"],
  "PetFoods.dat": ["alt"],
  "Other.dat": ["text"],
};

const dictionary: Record<string, string> = existsSync(DICTIONARY)
  ? JSON.parse(readFileSync(DICTIONARY, "utf8"))
  : {};

// Recorre el JSON y cambia los campos de texto por su traducción
function translate(node: unknown, fields: string[]): void {
  if (Array.isArray(node)) return node.forEach((item) => translate(item, fields));
  if (!node || typeof node !== "object") return;
  const object = node as Record<string, unknown>;
  for (const [key, value] of Object.entries(object)) {
    if (fields.includes(key) && typeof value === "string") {
      dictionary[value] ??= "";
      object[key] = dictionary[value] || value;
    } else translate(value, fields);
  }
}

for (const [file, fields] of Object.entries(FIELDS)) {
  const data = JSON.parse(readFileSync(`${ORIGINALS}/${file}`, "utf8"));
  translate(data, fields);
  writeFileSync(`${OUTPUT}/${file}`, JSON.stringify(data, null, "\t"));
}

mkdirSync("public/game/translations", { recursive: true });
writeFileSync(DICTIONARY, JSON.stringify(dictionary, null, 2));
const missing = Object.values(dictionary).filter((text) => !text).length;
console.log(`Textos: ${Object.keys(dictionary).length}, sin traducir: ${missing}`);
