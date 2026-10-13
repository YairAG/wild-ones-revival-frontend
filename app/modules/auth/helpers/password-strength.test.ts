import { expect, test } from "vitest";
import { passwordStrength } from "./password-strength";

test("vacía o corta: pide el mínimo", () => {
  expect(passwordStrength("")).toEqual({ score: 0, label: "Mínimo 8 caracteres." });
  expect(passwordStrength("abc").score).toBe(0);
});

test("suma un punto por largo, mayúsculas y minúsculas, número y símbolo (o 14+)", () => {
  expect(passwordStrength("abcdefgh")).toEqual({ score: 1, label: "Débil" });
  expect(passwordStrength("Abcdefgh")).toEqual({ score: 2, label: "Aceptable" });
  expect(passwordStrength("Abcdefg1")).toEqual({ score: 3, label: "Buena" });
  expect(passwordStrength("Abcdefg1!")).toEqual({ score: 4, label: "Muy buena" });
  expect(passwordStrength("abcdefghijklmn").score).toBe(2); // largo + 14 caracteres
});
