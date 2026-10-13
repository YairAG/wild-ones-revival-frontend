// Llamadas al backend de cuentas para la pestaña Cuenta de los ajustes.
import { accountsRequest as request } from "@/services/accounts-request";

export const accountApi = {
  changePassword: (current: string, next: string) =>
    request("POST", "/account/password", { current, next }),
  logoutOthers: () => request("POST", "/account/logout-others"),
  remove: (password: string) => request("DELETE", "/account", { password }),
};
