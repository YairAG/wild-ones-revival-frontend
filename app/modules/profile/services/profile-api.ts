// Llamadas al backend de cuentas para el perfil, los bloqueos y los reportes.
import { accountsRequest as request } from "@/services/accounts-request";
import type { PlayerProfile, ReportReason } from "../types";

export const profileApi = {
  get: async (id: number) => (await request<PlayerProfile>("GET", `/players/${id}`)).data!,
  block: (id: number) => request("POST", `/blocks/${id}`),
  unblock: (id: number) => request("DELETE", `/blocks/${id}`),
  report: (body: {
    targetId: number;
    reason: ReportReason;
    details?: string;
    messageId?: string;
  }) => request("POST", "/reports", body),
};
