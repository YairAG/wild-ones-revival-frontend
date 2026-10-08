# wild-ones-revival-frontend

Cliente web de Wild Ones Revival: login, lobby, tienda y partidas en tiempo real por WebSocket.
React + PixiJS + Tailwind + Zustand.

Habla con dos servidores:

- [wildones-accounts](https://github.com/YairAG/wildones-accounts): registro y login (HTTP). Devuelve un JWT.
- [Wild-Ones-Revival](https://github.com/YairAG/Wild-Ones-Revival): el servidor de juego (WebSocket). Se entra
  con ese JWT. El protocolo está tipado en el paquete [`wildones-protocol`](https://www.npmjs.com/package/wildones-protocol).

## Arrancar

    pnpm install
    cp .env.example .env   # URLs del backend de cuentas y del servidor de juego
    pnpm dev               # http://localhost:5173
    pnpm test

Necesita el backend de cuentas y el servidor de juego corriendo (ver sus README).

## Estructura

Organizado **por funcionalidad**: cada carpeta de `app/modules/` tiene todo lo de una función.

```
app/
  main.tsx               punto de entrada
  modules/
    auth/                entrar y crear cuenta
      screens/           pantallas (AuthScreen)
      components/        partes de la pantalla (AuthForm)
      services/          llamadas al backend de cuentas
      store.ts           estado (Zustand): sesión, modo, errores
      types.ts
    lobby/               el lobby del servidor de juego
      screens/ · components/ · store.ts · types.ts
  components/            UI reutilizable (Button, TextInput, ErrorMessage)
  services/              conexión con el servidor de juego (game-socket.ts), usada por varios módulos
  routes/                rutas (React Router) y loaders: protegen rutas y abren conexiones
  hooks/                 hooks reutilizables (si hacen falta)
  utils/                 funciones sueltas
```

**Estado con Zustand:** el estado y sus acciones viven en el `store.ts` de cada módulo. Los componentes solo
leen (`useLobbyStore((s) => s.player)`) y llaman acciones. Las conexiones se abren desde los _loaders_ de las
rutas, no con `useEffect`.

**Para agregar algo nuevo:**

- A un módulo que ya existe: su pantalla en `screens/`, sus partes en `components/`, su estado en `store.ts`.
- Un módulo nuevo (p. ej. tienda): carpeta `app/modules/shop/` con lo mismo, y su ruta en `routes/index.tsx`.

## Variables (`.env`)

| Variable            | Ejemplo                 | Qué es                        |
| ------------------- | ----------------------- | ----------------------------- |
| `VITE_ACCOUNTS_URL` | `http://localhost:3000` | Backend de cuentas            |
| `VITE_GAME_URL`     | `ws://localhost:8001`   | Servidor de juego (WebSocket) |
