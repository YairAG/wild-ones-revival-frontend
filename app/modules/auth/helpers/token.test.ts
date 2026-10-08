import { expect, test } from "vitest";
import { isTokenExpired } from "./token";

// JWT con el payload dado (firma inventada: aquí no se verifica)
const jwt = (payload: object) => `x.${btoa(JSON.stringify(payload))}.firma`;
const now = Math.floor(Date.now() / 1000);

test("token vigente", () => expect(isTokenExpired(jwt({ sub: "1", exp: now + 60 }))).toBe(false));
test("token caducado", () => expect(isTokenExpired(jwt({ sub: "1", exp: now - 1 }))).toBe(true));
test("token ilegible cuenta como caducado", () => expect(isTokenExpired("basura")).toBe(true));
