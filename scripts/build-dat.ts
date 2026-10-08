// Arma los .dat del juego: traduce sus textos con un diccionario inglés → español y aplica ajustes de datos.
//   node scripts/build-dat.ts
// Lee los originales de public/game/original-json/ y escribe el resultado en public/game/assets/json/.
// El diccionario (public/game/translations/es.json) es local, como el resto de public/game/: tiene textos de
// Playdom/Disney. Los textos que aún no estén en él se agregan vacíos ("") para traducirlos, y mientras
// se dejan en inglés.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { withoutAccents } from "./without-accents.ts";

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

// TEMPORAL (para probar): todas las mascotas de Pets.dat se desbloquean en el nivel 0. La tienda solo muestra
// las que Levels.dat desbloquea en algún nivel ("chassis"), y el original solo tenía 7. Se quitará cuando haya
// eventos de mascota nueva
const ALL_PETS_AT_LEVEL_0 = true;

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
      object[key] = withoutAccents(dictionary[value] || value);
    } else translate(value, fields);
  }
}

for (const [file, fields] of Object.entries(FIELDS)) {
  const data = JSON.parse(readFileSync(`${ORIGINALS}/${file}`, "utf8"));
  translate(data, fields);
  writeFileSync(`${OUTPUT}/${file}`, JSON.stringify(data, null, "\t"));
}

// Levels.dat: un objeto por nivel; "chassis" son las mascotas que desbloquea
const levels = JSON.parse(readFileSync(`${ORIGINALS}/Levels.dat`, "utf8"));
if (ALL_PETS_AT_LEVEL_0) {
  const pets: { type: string }[] = JSON.parse(readFileSync(`${ORIGINALS}/Pets.dat`, "utf8"));
  for (const level of levels) delete level.chassis;
  levels[0].chassis = pets.map((pet) => pet.type);
}
writeFileSync(`${OUTPUT}/Levels.dat`, JSON.stringify(levels, null, "\t"));

mkdirSync("public/game/translations", { recursive: true });
writeFileSync(DICTIONARY, JSON.stringify(dictionary, null, 2));
const missing = Object.values(dictionary).filter((text) => !text).length;
console.log(`Textos: ${Object.keys(dictionary).length}, sin traducir: ${missing}`);
