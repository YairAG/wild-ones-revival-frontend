// Llamadas al backend de cuentas para la pestaña Cuenta de los ajustes.
import { accountsRequest as request } from "@/services/accounts-request";
import type { DmPolicy } from "../types";

export const accountApi = {
  get: async () => (await request<{ dname: string; dmPolicy: DmPolicy }>("GET", "/account")).data!,
  setDmPolicy: (dmPolicy: DmPolicy) => request("POST", "/account/privacy", { dmPolicy }),
  changePassword: (current: string, next: string) =>
    request("POST", "/account/password", { current, next }),
  logoutOthers: () => request("POST", "/account/logout-others"),
  remove: (password: string) => request("DELETE", "/account", { password }),
};
