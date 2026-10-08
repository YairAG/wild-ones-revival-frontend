// Arma el SWF del juego en español a partir del original, siempre desde cero:
//   1. agrega a las fuentes las letras que les faltan (acentos, ñ...)    → swf/AddGlyphs.java
//   2. oculta botones de Facebook y de compras                            → swf/HideElements.java
//   3. traduce los textos que pone el código ("unlock at level "...)     → swf/ReplaceStrings.java
//   4. traduce los textos fijos con el diccionario e importa el resultado → JPEXS (-export / -importText)
//
//   node scripts/build-swf.ts
//
// Necesita Java y JPEXS FFDec (carpeta en FFDEC_DIR; por defecto C:/Program Files (x86)/FFDec).
// Todo lo de public/game/ es local (archivos de Playdom/Disney), también el diccionario.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { withoutAccents } from "./without-accents.ts";

const FFDEC_DIR = process.env.FFDEC_DIR ?? "C:/Program Files (x86)/FFDec";
const GAME = "public/game";
const ORIGINAL = `${GAME}/original-publicV1.swf`; // el SWF sin tocar
const OUTPUT = `${GAME}/publicV1.swf`; // el que carga Ruffle
const WORK = `${GAME}/translations/build`;
// Textos fijos: renglón en inglés → renglón en español. "#<id> renglón" traduce distinto solo en ese texto
// (p. ej. cuando no cabe)
const DICTIONARY = `${GAME}/translations/swf-es.json`;
// Textos del código: cadena exacta → cadena en español. Se llena a mano (ver ReplaceStrings.java)
const CODE_DICTIONARY = `${GAME}/translations/code-es.json`;
const FONTS = `${GAME}/translations/fonts`; // <nombre de la fuente>.ttf para las letras nuevas

// Botones y sprites a ocultar (ids dentro del SWF): GET TREATS del menú (normal y seleccionado), su etiqueta,
// "Get MORE" de la barra de arriba y "GET MORE TREATS" de la ventana de "no te alcanza"
const HIDDEN = [1453, 1433, 219, 378, 562];

// Fuentes "Chinese Rocks" (la de los menús): solo tiene mayúsculas, así que sus textos van en mayúsculas
const UPPERCASE_FONTS = new Set([
  14, 61, 88, 182, 224, 306, 387, 418, 461, 515, 604, 681, 1195, 1223, 1325, 1465, 1479, 1949, 1983,
  2046,
]);

const java = (...args: string[]) =>
  execFileSync("java", args, { stdio: ["ignore", "inherit", "inherit"] });
const ffdec = (...args: string[]) => java("-jar", `${FFDEC_DIR}/ffdec-cli.jar`, ...args);
const javaTool = (tool: string, ...args: string[]) =>
  java("-cp", `${FFDEC_DIR}/lib/*`, `scripts/swf/${tool}.java`, ...args);

// En los textos exportados por JPEXS, "[", "]" y "\" van escapados con "\"
const unescape = (text: string) => text.replace(/\\([[\]\\])/g, "$1");
const escape = (text: string) => text.replace(/([[\]\\])/g, "\\$1");

// Traduce un renglón. Si trae HTML (campos de texto editables), solo el texto entre etiquetas.
// Lo que no tiene palabras (números, letras sueltas como "A" o "D") se deja igual
function translate(text: string, id: string): string {
  if (text.startsWith("<"))
    return text.replace(/>([^<]+)</g, (_, inner: string) => `>${translate(inner, id)}<`);
  if (!/[a-z]{2,}/i.test(text)) return text;
  dictionary[text] ??= "";
  const translated = dictionary[`#${id} ${text}`] || dictionary[text];
  return translated ? withoutAccents(translated) : text;
}

if (!existsSync(ORIGINAL)) throw new Error(`Falta ${ORIGINAL} (copia del publicV1.swf original)`);
rmSync(WORK, { recursive: true, force: true });
mkdirSync(`${WORK}/import/texts`, { recursive: true });

// 1 y 2: letras nuevas y elementos ocultos
javaTool("AddGlyphs", ORIGINAL, `${WORK}/1-glyphs.swf`, FONTS);
javaTool("HideElements", `${WORK}/1-glyphs.swf`, `${WORK}/2-hidden.swf`, HIDDEN.join(","));

// 3: textos del código, como lista "original<TAB>nuevo" (saltos de línea como \n)
const codeDictionary: Record<string, string> = existsSync(CODE_DICTIONARY)
  ? JSON.parse(readFileSync(CODE_DICTIONARY, "utf8"))
  : {};
const tsvEscape = (text: string) => text.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
writeFileSync(
  `${WORK}/code.tsv`,
  Object.entries(codeDictionary)
    .map(([from, to]) => `${tsvEscape(from)}\t${tsvEscape(withoutAccents(to))}`)
    .join("\n"),
  "utf8",
);
javaTool("ReplaceStrings", `${WORK}/2-hidden.swf`, `${WORK}/3-code.swf`, `${WORK}/code.tsv`);

// 4: textos fijos. Cada archivo exportado es "[límites]" seguido de renglones "[formato]texto"
ffdec("-format", "text:formatted", "-export", "text", `${WORK}/texts`, ORIGINAL);
const dictionary: Record<string, string> = existsSync(DICTIONARY)
  ? JSON.parse(readFileSync(DICTIONARY, "utf8"))
  : {};

for (const file of readdirSync(`${WORK}/texts`)) {
  const source = readFileSync(`${WORK}/texts/${file}`, "utf8");
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  // Separa en [formato, texto]; el primer bloque son los límites (sin texto). El formato puede traer
  // corchetes entre comillas (spacingpair "]" "" -46)
  const parts = source.split(/(?<!\\)\[((?:"(?:[^"\\]|\\.)*"|[^\]"])*)\]/);
  let font = 0;
  let changed = false;
  let result = parts[0];
  for (let i = 1; i < parts.length; i += 2) {
    let format = parts[i];
    const text = unescape(parts[i + 1] ?? "");
    font = Number(/font (\d+)/.exec(format)?.[1] ?? font); // la fuente se hereda del renglón anterior
    let translated = translate(text, file.replace(".txt", ""));
    if (translated !== text) {
      changed = true;
      if (UPPERCASE_FONTS.has(font)) translated = translated.toUpperCase();
      // El espaciado entre letras era para el texto original
      format = format
        .split(newline)
        .filter((line) => !/^spacing(pair)? /.test(line))
        .join(newline);
    }
    result += `[${format}]${escape(translated)}`;
  }
  if (changed) writeFileSync(`${WORK}/import/texts/${file}`, result, "utf8");
}

writeFileSync(DICTIONARY, JSON.stringify(dictionary, null, 2));
ffdec("-importText", `${WORK}/3-code.swf`, OUTPUT, `${WORK}/import`);

const missing = Object.values(dictionary).filter((text) => !text).length;
console.log(
  `Listo: ${OUTPUT}. Renglones: ${Object.keys(dictionary).length}, sin traducir: ${missing}`,
);
