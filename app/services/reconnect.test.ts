import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createReconnector, MAX_ATTEMPTS } from "./reconnect";
import type { ReconnectState } from "./types";

let state: ReconnectState;
let connect: ReturnType<typeof vi.fn<() => void>>;
let reconnector: ReturnType<typeof createReconnector>;

beforeEach(() => {
  vi.useFakeTimers();
  connect = vi.fn<() => void>();
  reconnector = createReconnector(connect, (s) => (state = s));
});
afterEach(() => vi.useRealTimers());

test("al caerse cuenta 5 s y reintenta; al volver queda conectado", () => {
  reconnector.dropped();
  expect(state).toEqual({ lost: true, attempt: 0, secondsLeft: 5, failed: false });
  vi.advanceTimersByTime(4_000);
  expect(state.secondsLeft).toBe(1);
  expect(connect).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1_000);
  expect(connect).toHaveBeenCalledTimes(1);
  expect(state).toEqual({ lost: true, attempt: 1, secondsLeft: 0, failed: false });

  reconnector.restored();
  expect(state.lost).toBe(false);
  vi.advanceTimersByTime(60_000);
  expect(connect).toHaveBeenCalledTimes(1); // ya no reintenta
});

test("tras 5 intentos fallidos se rinde; Reintentar empieza de nuevo", () => {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    reconnector.dropped(); // la conexión se cerró otra vez
    vi.advanceTimersByTime(5_000);
  }
  expect(connect).toHaveBeenCalledTimes(MAX_ATTEMPTS);
  reconnector.dropped();
  expect(state.failed).toBe(true);
  vi.advanceTimersByTime(60_000);
  expect(connect).toHaveBeenCalledTimes(MAX_ATTEMPTS);

  reconnector.retryNow();
  expect(connect).toHaveBeenCalledTimes(MAX_ATTEMPTS + 1);
  expect(state).toEqual({ lost: true, attempt: 1, secondsLeft: 0, failed: false });
});

test("Reconectar ya no espera la cuenta regresiva; stop cancela los reintentos", () => {
  reconnector.dropped();
  reconnector.retryNow();
  expect(connect).toHaveBeenCalledTimes(1);
  reconnector.dropped();
  reconnector.stop();
  vi.advanceTimersByTime(60_000);
  expect(connect).toHaveBeenCalledTimes(1);
});
