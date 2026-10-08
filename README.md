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

Los nombres y descripciones de armas, accesorios, regalos y comida están en los `.dat`. Se traducen con:

    node scripts/translate-dat.ts

Lee los originales de `public/game/original-json/` (copia de los `.dat` sin tocar), aplica el diccionario
`public/game/translations/es.json` y escribe en `public/game/assets/json/`. El diccionario es local como todo
`public/game/` (tiene los textos originales); los textos nuevos se agregan vacíos para traducirlos.

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
