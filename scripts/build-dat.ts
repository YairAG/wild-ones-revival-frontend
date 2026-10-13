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
// Los poderes de mascota son armas (petWeapon en WeaponsGrid), y el cliente solo muestra los que tienes. Las
// del nivel 0 ("weapon") las tienen todos; el original solo traía ahí las de las mascotas que daba por nivel.
// El cliente ya filtra por la mascota actual. Si su baseType no es un arma del .dat, el cliente descarta el
// poder y truena al equiparlo (pasa con fishspit, baseType "spit")
const grid: { type: string; petWeapon?: boolean; baseType?: string }[] = JSON.parse(
  readFileSync(`${ORIGINALS}/WeaponsGrid.dat`, "utf8"),
);
const types = grid.map((weapon) => weapon.type);
const powers = grid
  .filter((weapon) => weapon.petWeapon && (!weapon.baseType || types.includes(weapon.baseType)))
  .map((weapon) => weapon.type);
levels[0].weapon = [...new Set([...levels[0].weapon, ...powers])];
// La tienda solo ofrece las mascotas que Levels.dat desbloquea ("chassis") y las que ya tienes. El original
// daba 7 por nivel y las demás llegaban por otro lado (no sabemos cómo). Se venden desde el nivel 0 las que
// tienen un poder que el SWF sabe usar; las que no tienen poder (o es uno que el SWF no trae) se quedan fuera
const pets: { type: string; petPower: string }[] = JSON.parse(
  readFileSync(`${ORIGINALS}/Pets.dat`, "utf8"),
);
const byLevel = levels.flatMap((level: { chassis?: string[] }) => level.chassis ?? []);
const withPower = pets.filter(
  (pet) => powers.includes(pet.petPower) && !byLevel.includes(pet.type),
);
levels[0].chassis = [...(levels[0].chassis ?? []), ...withPower.map((pet) => pet.type)];
writeFileSync(`${OUTPUT}/Levels.dat`, JSON.stringify(levels, null, "\t"));

mkdirSync("public/game/translations", { recursive: true });
writeFileSync(DICTIONARY, JSON.stringify(dictionary, null, 2));
const missing = Object.values(dictionary).filter((text) => !text).length;
console.log(`Textos: ${Object.keys(dictionary).length}, sin traducir: ${missing}`);
