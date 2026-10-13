// Arma el SWF del juego en español a partir del original, siempre desde cero:
//   1. agrega a las fuentes las letras que les faltan (acentos, ñ...)    → swf/AddGlyphs.java
//   2. oculta botones de Facebook y de compras                            → swf/HideElements.java
//   3. traduce los textos que pone el código ("unlock at level "...)     → swf/ReplaceStrings.java
//   4. redibuja las palabras que son dibujos (HOME, MULTIPLAYER, SHOP)   → swf/RedrawLabels.java
//   5. cambia código del juego (p. ej. activar "listo" en la sala)      → JPEXS (-export / -importScript)
//   6. traduce los textos fijos con el diccionario e importa el resultado → JPEXS (-export / -importText)
//   7. recorta el escenario por abajo (ya no está la barra de vecinos)    → JPEXS (-header)
//
//   node scripts/build-swf.ts
//
// Necesita Java y JPEXS FFDec (carpeta en FFDEC_DIR; por defecto C:/Program Files (x86)/FFDec).
// Todo lo de public/game/ es local (archivos de Playdom/Disney), también el diccionario.
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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
// Copia de "Chinese Rocks" (la fuente de los menús) que trae todas las mayúsculas. Las demás copias solo traen
// las letras de su texto, así que las que les faltan se toman de esta (se exporta del mismo SWF)
const FULL_CHINESE_ROCKS = "88";

// Botones y sprites a ocultar (ids dentro del SWF): GET TREATS del menú (normal y seleccionado), su etiqueta,
// "Get MORE" de la barra de arriba y "GET MORE TREATS" de la ventana de "no te alcanza". Y los botones del
// encabezado: SEND GIFTS, HELP, FORUM e INVITE (eran de Facebook y de la web de 2013). 1698: el sello "NEW"
// del cajón de mascotas de la tienda (es un dibujo fijo: decía "nuevo" siempre)
const HIDDEN = [1453, 1433, 219, 378, 562, 257, 248, 251, 254, 1698];

// Palabras del menú lateral que son dibujos (no texto), por id del dibujo: la versión al pasar el mouse, la
// seleccionada y la de la pantalla de inicio (206 y 208)
const LABELS: Record<string, string> = {
  1436: "INICIO",
  1412: "INICIO",
  1449: "MULTIJUGADOR",
  1416: "MULTIJUGADOR",
  208: "MULTIJUGADOR",
  1446: "TIENDA",
  1427: "TIENDA",
  206: "TIENDA",
  932: "DIA", // calendario de la Mision Laser
  // Tienda: el título y los cuatro cajones, cerrados (palabra blanca) y abiertos al pasar el mouse (naranja;
  // mapas y accesorios traen además una blanca). MAPAS no se ve: el juego esconde ese cajón. ">" alinea a la
  // derecha, como el original (las palabras en español son más largas y se salían del botón)
  1633: "TIENDA",
  1635: "ARMAS>",
  1644: "ARMAS>",
  1659: "MASCOTAS>",
  1699: "MASCOTAS>",
  1724: "MAPAS>",
  1728: "MAPAS>",
  1748: "MAPAS>",
  1752: "ACCESORIOS>",
  1807: "ACCESORIOS>",
  1809: "ACCESORIOS>",
};
// Fondos que se alargan para que quepa el texto en español: "<id>*<veces más ancho>" o "<id>@<y0>:<y1>+<px>"
// por renglón (ver RedrawLabels.java). 195: etiquetas de inicio (MULTIJUGADOR, MIS MASCOTAS, TIENDA);
// 1370: caja de "SE DESBLOQUEA EN NIVEL"
const LABEL_BACKGROUNDS = [
  "1410*1.1",
  "1415*1.115",
  "1426*1.13",
  "195@56:85+17,152:181+38,200:229+11",
  "1370@-1:52+45",
];

// Alto del escenario: el original mide 760 x 740, pero lo de abajo de y=555 era la barra de vecinos (el lobby y
// los controles de la partida terminan ahí)
const STAGE_HEIGHT = 555;

// Mascotas para la web (perfil, cabecera), en un reproductor aparte en modo retrato (ver SCRIPT_PATCHES): la
// página pide una con requestPet(id, mascota, tamaño) y el SWF la arma con AnimalGraphics, la misma clase que
// usa el juego (con su ropa y colores). La dibuja en su siguiente cuadro (dibujar dentro de la llamada de
// JavaScript rompe a Ruffle) y, si los dibujos todavía no cargan, espera.
// Luego llama a wildRevivalPet(id, píxeles) en la página: un cuadro de tamaño x tamaño en ARGB, o null si no se
// pudo (el SWF no trae un codificador de PNG)
const PET_RENDERER = `
      private var petRequests:Array = [];

      private function requestPet(id:String, pet:Object, size:int) : void
      {
         petRequests.push({"id":id,"pet":pet,"size":size});
         addEventListener(Event.ENTER_FRAME,renderRequestedPets);
      }

      private function petsReady() : Boolean
      {
         // Toda la precarga terminada: los dibujos de mascotas llegan antes que los de la ropa
         return Boolean(Ballistics.assets) && !AssetManager.is_preloading && Boolean(Ballistics.chassisObject) && Boolean(Ballistics.accessoriesObject);
      }

      private function renderRequestedPets(e:Event) : void
      {
         if(!petsReady())
         {
            return;
         }
         removeEventListener(Event.ENTER_FRAME,renderRequestedPets);
         var requests:Array = petRequests;
         petRequests = [];
         for each(var request:Object in requests)
         {
            var pixels:Array = null;
            try
            {
               pixels = renderPet(request.pet,request.size);
            }
            catch(error:Error)
            {
               pixels = null;
            }
            ExternalInterface.call("wildRevivalPet",request.id,pixels);
         }
      }

      private function renderPet(pet:Object, size:int) : Array
      {
         if(!pet || !Ballistics.chassisObject[pet.type])
         {
            return null;
         }
         var animal:AnimalGraphics = new AnimalGraphics(new OwnedPet(pet));
         var bounds:Rectangle = animal.getBounds(animal);
         if(bounds.width == 0 || bounds.height == 0)
         {
            return null;
         }
         var scale:Number = size / Math.max(bounds.width,bounds.height);
         var matrix:Matrix = new Matrix(scale,0,0,scale,(size - bounds.width * scale) / 2 - bounds.x * scale,(size - bounds.height * scale) / 2 - bounds.y * scale);
         var bitmap:BitmapData = new BitmapData(size,size,true,0);
         bitmap.draw(animal,matrix,null,null,null,true);
         var bytes:ByteArray = bitmap.getPixels(bitmap.rect);
         var pixels:Array = [];
         bytes.position = 0;
         while(bytes.bytesAvailable > 0)
         {
            pixels.push(bytes.readUnsignedInt());
         }
         return pixels;
      }
`;

// Cambios al código del juego. Por cada clase: [qué buscar (expresión regular), por qué cambiarlo]. En el repo
// solo está esto; el código original se exporta del SWF al armarlo
const SCRIPT_PATCHES: Record<string, [RegExp, string][]> = {
  // Mascotas para la web (ver PET_RENDERER): las clases que usa, las funciones y el registro de requestPet
  Ballistics: [
    [
      /(import flash\.utils\.Timer;)/,
      "$1\n   import flash.display.BitmapData;\n   import flash.geom.Matrix;\n   import flash.geom.Rectangle;\n" +
        "   import flash.utils.ByteArray;\n   import com.playdom.ballistics.avatar.AnimalGraphics;",
    ],
    [
      /(ExternalInterface\.addCallback\("onFriendInfo",\s*(?:this\.)?onFriendInfo\);)/,
      '$1\n            ExternalInterface.addCallback("requestPet",requestPet);',
    ],
    // Modo retrato (parámetro petRenderer=1): carga datos y dibujos como siempre, pero no se conecta al lobby.
    // Lo usa un segundo reproductor invisible de la página solo para dibujar mascotas, con un motor gráfico que
    // sí sabe dibujar en BitmapData (el del juego, webgl, no)
    [
      /(appLauncher\.addEventListener\("onApplicationInitialized",\s*(?:Ballistics\.)?initLobbyConnection,\s*false,\s*0,\s*true\);)/,
      'if(stage.loaderInfo.parameters.petRenderer != "1")\n         {\n            $1\n         }',
    ],
    [/(\n\s*private function preinit\()/, `\n${PET_RENDERER}$1`],
  ],
  // Barra de vecinos de abajo (amigos de Facebook): se esconde en vez de quitarla porque otras partes del juego
  // la leen (Ballistics.ladder). Los amigos ya están en el panel de la web
  "com.playdom.ballistics.home.MainView": [
    [/(addChild\((?:this\.)?_ladderView\);)/, "$1 _ladderView.visible = false;"],
  ],
  // El perfil mini (al hacer clic en un jugador) no baja de 740 - 200; con el escenario recortado quedaría
  // cortado
  "com.playdom.ballistics.home.OverlayView": [[/740 - 200/g, `${STAGE_HEIGHT} - 200`]],
  // Sala de espera: el original te marcaba "listo" siempre y escondía los botones. Ahora empiezas sin estar
  // listo, el estado sale del servidor y se ve el botón "listo" o "no listo" según toque. Las flechas de
  // mascota se esconden: en el original solo giraban en pantalla, no cambiaban la mascota
  "com.playdom.ballistics.gameroomlobby.GameRoomLobbyMainView": [
    [/(addDataChangeEventHandlers\(\);\s*this\.setReadyState\()true\)/, "$1false)"],
    [
      /(getPlayerStatus\(mainModel\.player\.id\);\s*this\.setReadyState\()true\)/,
      '$1playerStatus == "ready")',
    ],
    [
      /(this\.readyOverlayCheck\.visible = isReady;)/,
      "$1 this.readyButton.visible = !isReady; this.notReadyButton.visible = isReady;" +
        " this.previousPetButton.visible = this.nextPetButton.visible = false;",
    ],
  ],
  // Poderes de mascota con el código hecho pero sin conectar: scratch (gato) tiene Avatar.processScratch y
  // dinoquake (dino) lo maneja la clase Earthquake, pero MakeWeapon no los usaba y no hacían nada.
  // Además llamaban a funciones que no existen (Sounds.playScratch, Sounds.playDinoquake,
  // AnimalGraphics.SCRATCH): el error cortaba la partida. Se usan los sonidos y el dibujo que sí trae el juego
  "com.playdom.ballistics.avatar.Avatar": [
    [/Sounds\.playScratch\(\)/, 'Sounds.playSound("CatPower_Scratch.mp3")'],
    [/AnimalGraphics\.SCRATCH/, '"_scratch"'],
    // battle (canguro) es un punch (baseType), pero processPunch siempre usaba los datos, el dibujo y el
    // sonido del panda. Ahora recibe el tipo y usa los suyos (daño 650, kangaroo_battle, battle.mp3)
    [/public function processPunch\(\)/, 'public function processPunch(type:String = "punch")'],
    [/Ballistics\.weaponObject\["punch"\]/, "Ballistics.weaponObject[type]"],
    [
      /Sounds\.playSmack\(\);/,
      'if(type == "punch") Sounds.playSmack(); else Sounds.playSound(type + ".mp3");',
    ],
    [/AnimalGraphics\.PUNCH;/, 'type == "punch" ? AnimalGraphics.PUNCH : "_" + type;'],
  ],
  "com.playdom.ballistics.weapons.Earthquake": [
    [/Sounds\.playDinoquake\(\)/g, 'Sounds.playSound("dinoquake.mp3")'],
  ],
  "com.playdom.ballistics.weapons.MakeWeapon": [
    [/("earthquake":Earthquake,)/, '$1\n         "dinoquake":Earthquake,'],
    [
      /(else if\(classType == "punch"\)\s*\{\s*source\.processPunch\()(\);\s*\})/,
      '$1type$2\n         else if(classType == "scratch")\n         {\n            source.processScratch();\n         }',
    ],
  ],
};

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
ffdec(
  "-format",
  "font:ttf",
  "-selectid",
  FULL_CHINESE_ROCKS,
  "-export",
  "font",
  `${WORK}/fonts`,
  ORIGINAL,
);
renameSync(
  `${WORK}/fonts/${FULL_CHINESE_ROCKS}_Chinese Rocks.ttf`,
  `${WORK}/fonts/Chinese Rocks.ttf`,
);
javaTool("AddGlyphs", ORIGINAL, `${WORK}/1-glyphs.swf`, `${WORK}/fonts`);
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

// 4: palabras dibujadas, con la Chinese Rocks completa (se exportan como SVG para quitar la palabra vieja)
const shapes = [...Object.keys(LABELS), ...LABEL_BACKGROUNDS.map((arg) => arg.split(/[*@]/)[0])];
ffdec(
  "-format",
  "shape:svg",
  "-selectid",
  shapes.join(","),
  "-export",
  "shape",
  `${WORK}/svg`,
  ORIGINAL,
);
javaTool(
  "RedrawLabels",
  `${WORK}/3-code.swf`,
  `${WORK}/4-labels.swf`,
  `${WORK}/svg`,
  `${WORK}/fonts/Chinese Rocks.ttf`,
  ...Object.entries(LABELS).map(([id, word]) => `${id}=${word}`),
  ...LABEL_BACKGROUNDS,
);

// 5: código del juego. Se exporta cada clase, se le aplican los cambios y JPEXS la vuelve a compilar
const classes = Object.keys(SCRIPT_PATCHES);
ffdec("-selectclass", classes.join(","), "-export", "script", `${WORK}/as`, `${WORK}/4-labels.swf`);
for (const className of classes) {
  const file = `${WORK}/as/scripts/${className.replace(/\./g, "/")}.as`;
  let source = readFileSync(file, "utf8");
  for (const [find, replace] of SCRIPT_PATCHES[className]) {
    if (!find.test(source)) throw new Error(`${className}: no encontré ${find}`); // el SWF cambió
    source = source.replace(find, replace);
  }
  writeFileSync(file, source, "utf8");
}
ffdec("-importScript", `${WORK}/4-labels.swf`, `${WORK}/5-code.swf`, `${WORK}/as`);

// 6: textos fijos. Cada archivo exportado es "[límites]" seguido de renglones "[formato]texto"
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
      // El espaciado entre letras era para el texto original (y compensaba que la fuente no tenía medidas,
      // ver AddGlyphs.java): se quita y el espaciado general vuelve a 0
      format = format
        .split(newline)
        .filter((line) => !/^spacing(pair)? /.test(line))
        .map((line) => line.replace(/^letterspacing .*/, "letterspacing 0"))
        .join(newline);
    }
    result += `[${format}]${escape(translated)}`;
  }
  if (changed) writeFileSync(`${WORK}/import/texts/${file}`, result, "utf8");
}

writeFileSync(DICTIONARY, JSON.stringify(dictionary, null, 2));
ffdec("-importText", `${WORK}/5-code.swf`, `${WORK}/6-texts.swf`, `${WORK}/import`);

// 7: el escenario se corta donde estaba la barra de vecinos (ver SCRIPT_PATCHES)
ffdec("-header", "-set", "height", `${STAGE_HEIGHT}px`, `${WORK}/6-texts.swf`, OUTPUT);

const missing = Object.values(dictionary).filter((text) => !text).length;
console.log(
  `Listo: ${OUTPUT}. Renglones: ${Object.keys(dictionary).length}, sin traducir: ${missing}`,
);
