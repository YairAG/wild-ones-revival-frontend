// Llamadas al backend de cuentas (wildones-accounts).
import type { Session } from "../types";

const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL;

async function post(path: string, body: object): Promise<Session> {
  const res = await fetch(ACCOUNTS_URL + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error inesperado"); // el backend responde { error: "mensaje" }
  return data;
}

export const accountsApi = {
  register: (dname: string, password: string) => post("/register", { dname, password }),
  login: (dname: string, password: string) => post("/login", { dname, password }),
};
