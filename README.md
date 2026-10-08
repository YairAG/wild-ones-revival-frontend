# wild-ones-revival-frontend

Cliente web de Wild Ones Revival. Hace el login (registro y entrada) y luego carga el **cliente original del
juego** (SWF) con [Ruffle](https://ruffle.rs), conectado a nuestros servidores.

Habla con dos servidores:

- [wildones-accounts](https://github.com/YairAG/wildones-accounts): registro y login (HTTP). Devuelve un JWT.
- [Wild-Ones-Revival](https://github.com/YairAG/Wild-Ones-Revival): el servidor de juego (WebSocket). El SWF
  entra con ese JWT.

## Arrancar

    pnpm install
    cp .env.example .env   # URLs del backend de cuentas y del servidor de juego
    pnpm dev               # http://localhost:5173
    pnpm test

Necesita el backend de cuentas, el servidor de juego y los archivos del cliente original (abajo).

## Archivos del cliente original (`public/game/`)

El SWF y sus gráficos **no están en el repo** (son de Playdom/Disney; `public/game/` está en `.gitignore`).
Se copian a mano desde la carpeta `Web/` de [fgpons/wo-latin-ps](https://github.com/fgpons/wo-latin-ps):

| Origen (`wo-latin-ps/Web/`)      | Destino                    |
| -------------------------------- | -------------------------- |
| `privatewolswf/publicV1.swf`     | `public/game/publicV1.swf` |
| `assets/*.swf`                   | `public/game/assets/`      |
| `images/` (carpeta entera)       | `public/game/images/`      |
| los `.dat` (`assets/json/*.dat`) | `public/game/assets/json/` |

### Traducción al español

Los nombres y descripciones de armas, accesorios, regalos y comida están en los `.dat`. Se arman con:

    node scripts/build-dat.ts

Lee los originales de `public/game/original-json/` (copia de los `.dat` sin tocar), aplica el diccionario
`public/game/translations/es.json` y escribe en `public/game/assets/json/`. El diccionario es local como todo
`public/game/` (tiene los textos originales); los textos nuevos se agregan vacíos para traducirlos.

Ajuste temporal: con `ALL_PETS_AT_LEVEL_0` las 30 mascotas de `Pets.dat` se desbloquean en el nivel 0 (el
original solo desbloqueaba 7 por nivel en `Levels.dat`).

El resto de los textos (menús, botones, tutorial) están dentro del SWF. Se arma un `publicV1.swf` en español con:

    node scripts/build-swf.ts

Parte siempre de `public/game/original-publicV1.swf` (copia del SWF sin tocar) y necesita Java y
[JPEXS FFDec](https://github.com/jindrapetrik/jpexs-decompiler) (carpeta en `FFDEC_DIR`, por defecto
`C:/Program Files (x86)/FFDec`):

1. `scripts/swf/AddGlyphs.java`: agrega a las fuentes del SWF las letras que les faltan (cada fuente solo traía
   las de su texto original). Las de los menús salen de la copia completa de "Chinese Rocks" que trae el mismo SWF (se exporta como .ttf);
   las demás, de la fuente instalada en Windows con ese nombre.
2. `scripts/swf/HideElements.java`: oculta botones de compras con dinero real (los deja vacíos para no romper
   el código del juego).
3. `scripts/swf/ReplaceStrings.java`: traduce los textos que pone el código del juego (p. ej. "unlock at level ")
   con el diccionario local `public/game/translations/code-es.json`, revisado a mano porque la misma cadena podría
   ser una clave interna.
4. `scripts/swf/RedrawLabels.java`: redibuja las palabras del menú que son dibujos y no texto (HOME → INICIO,
   MULTIPLAYER → MULTIJUGADOR, SHOP → TIENDA) con la misma fuente, y alarga su fondo.
5. Traduce los textos fijos con el diccionario local `public/game/translations/swf-es.json` y los importa con
   JPEXS. Una clave `#<id> texto` traduce distinto solo ese texto (cuando no cabe).

## Cómo se conecta el SWF (`app/modules/game/services/ruffle.ts`)

El SWF original está hecho para la web de 2018: pide sus archivos a `http://localhost/…` y se conecta por
socket a `localhost:8000`. Ruffle lo redirige sin tocar el SWF:

- `urlRewriteRules`: `http://localhost/…` → `/game/…` (los archivos de `public/game/`).
- `socketProxy`: `localhost:8000` → el WebSocket del servidor de juego (`VITE_GAME_URL`). No hace falta
  `websockify`.
- Login: el SWF lee `dname` y `snum` de sus parámetros. En `snum` se le pasa el JWT, y el servidor de juego lo
  acepta ahí.

## Estructura

Organizado **por funcionalidad**: cada carpeta de `app/modules/` tiene todo lo de una función.

```
app/
  main.tsx               punto de entrada
  modules/
    auth/                entrar y crear cuenta
      screens/ · components/ · services/ (backend de cuentas) · store.ts · types.ts
    game/                el juego original en Ruffle
      screens/GameScreen.tsx · services/ruffle.ts · store.ts · types.ts
  components/            UI reutilizable (Button, TextInput, ErrorMessage)
  services/              servicios compartidos entre módulos
  routes/                rutas (React Router) y loaders (protegen rutas)
  hooks/ · utils/
```

**Estado con Zustand:** el estado y sus acciones viven en el `store.ts` de cada módulo. Los componentes solo
leen y llaman acciones.

## Variables (`.env`)

| Variable            | Ejemplo                 | Qué es                        |
| ------------------- | ----------------------- | ----------------------------- |
| `VITE_ACCOUNTS_URL` | `http://localhost:3000` | Backend de cuentas            |
| `VITE_GAME_URL`     | `ws://localhost:8001`   | Servidor de juego (WebSocket) |
