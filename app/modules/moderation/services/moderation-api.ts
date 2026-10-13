// Llamadas al backend de cuentas para el panel de moderación (solo moderadores).
import { accountsRequest as request } from "@/services/accounts-request";
import type { ModerationSummary } from "../types";

export const moderationApi = {
  summary: async () => (await request<ModerationSummary>("GET", "/chat/moderation")).data!,
  unmute: (id: number) => request("DELETE", `/chat/mutes/${id}`),
};
