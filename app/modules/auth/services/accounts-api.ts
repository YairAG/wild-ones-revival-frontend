// Llamadas al backend de cuentas para la sesión (wildones-accounts). Devuelven la sesión que viene en `data`.
// El refresh token no pasa por aquí: va en una cookie httpOnly que el navegador manda y guarda solo.
import { accountsRequest } from "@/services/accounts-request";
import type { Session } from "../types";

// Sin token de acceso: estas rutas son justo para conseguirlo
const post = async (path: string, body?: object) =>
  (await accountsRequest<Session>("POST", path, body, { auth: false })).data!;

export const accountsApi = {
  register: (dname: string, password: string) => post("/register", { dname, password }),
  login: (dname: string, password: string) => post("/login", { dname, password }),
  refresh: () => post("/refresh"),
  logout: () => accountsRequest("POST", "/logout", undefined, { auth: false }),
  nameAvailable: async (dname: string) =>
    (
      await accountsRequest<{ available: boolean }>(
        "GET",
        `/register/available?dname=${encodeURIComponent(dname)}`,
        undefined,
        { auth: false },
      )
    ).data!.available,
};
