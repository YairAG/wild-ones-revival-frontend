import { describe, expect, test } from "vitest";
import { createDecoder, encode } from "./game-socket";

describe("protocolo del servidor de juego", () => {
  test("encode: 6 dígitos de longitud + JSON", () => {
    expect(encode({ command: "ping" })).toBe('000018{"command":"ping"}');
  });

  test("decode: quita la cabecera de la primera respuesta y separa varios mensajes", () => {
    const decode = createDecoder();
    const text =
      'Originality is undetected plagiarism.\r\n\r\n000022{"command":"ping_ack"}000022{"command":"ping_ack"}';
    expect(decode(text)).toEqual([{ command: "ping_ack" }, { command: "ping_ack" }]);
  });

  test("decode: un mensaje partido en dos trozos se entrega cuando está completo", () => {
    const decode = createDecoder();
    expect(decode('000022{"command":')).toEqual([]);
    expect(decode('"ping_ack"}')).toEqual([{ command: "ping_ack" }]);
  });
});
