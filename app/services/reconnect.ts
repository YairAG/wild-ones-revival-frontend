// Reconexión automática de un WebSocket que se cayó: reintenta cada RETRY_SECONDS segundos, hasta
// MAX_ATTEMPTS veces, con cuenta regresiva para mostrarla. La usan el chat y la conexión social.
//
//   const reconnector = createReconnector(open, (state) => set({ reconnect: state }));
//   al cerrarse sola la conexión → reconnector.dropped()   al volver a entrar → reconnector.restored()
import type { ReconnectState } from "./types";

export const RETRY_SECONDS = 5;
export const MAX_ATTEMPTS = 5;

export const CONNECTED: ReconnectState = { lost: false, attempt: 0, secondsLeft: 0, failed: false };

export function createReconnector(connect: () => void, onChange: (state: ReconnectState) => void) {
  let state = CONNECTED;
  let timer: ReturnType<typeof setInterval> | undefined;

  const update = (next: ReconnectState) => {
    state = next;
    onChange(next);
  };
  const stopTimer = () => {
    clearInterval(timer);
    timer = undefined;
  };

  function retryNow() {
    stopTimer();
    const attempt = state.failed ? 1 : state.attempt + 1; // tras rendirse, "Reintentar" empieza de nuevo
    update({ lost: true, attempt, secondsLeft: 0, failed: false }); // 0 s: intentando
    connect(); // si no entra, la conexión se cierra y llama a dropped() otra vez
  }

  return {
    dropped() {
      stopTimer();
      if (state.attempt >= MAX_ATTEMPTS) return update({ ...state, lost: true, failed: true });
      update({ ...state, lost: true, secondsLeft: RETRY_SECONDS });
      timer = setInterval(() => {
        if (state.secondsLeft > 1) update({ ...state, secondsLeft: state.secondsLeft - 1 });
        else retryNow();
      }, 1000);
    },
    restored() {
      stopTimer();
      update(CONNECTED);
    },
    retryNow,
    // Al cerrar la conexión a propósito (salir de la pantalla): sin reintentos pendientes
    stop() {
      stopTimer();
      state = CONNECTED;
    },
  };
}
