// Llamadas al backend de cuentas para entrar (wildones-accounts). Devuelven la sesión que viene en `data`.
import { accountsRequest } from "@/services/accounts-request";
import type { Session } from "../types";

const post = async (path: string, body: object) =>
  (await accountsRequest<Session>("POST", path, body)).data!;

export const accountsApi = {
  register: (dname: string, password: string) => post("/register", { dname, password }),
  login: (dname: string, password: string) => post("/login", { dname, password }),
};
