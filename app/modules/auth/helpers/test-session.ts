// Solo para tests: una sesión con un JWT que no vence (firma inventada; en los tests nadie la verifica)
export const testSession = {
  id: 1,
  dname: "Ana",
  token: `x.${btoa(JSON.stringify({ sub: "1", exp: 4102444800 }))}.firma`,
};
