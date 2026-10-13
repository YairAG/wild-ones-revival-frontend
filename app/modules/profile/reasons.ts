// Cómo se dice cada motivo de reporte (formulario de reporte y panel de moderación)
import type { ReportReason } from "./types";

export const reportReasonLabel: Record<ReportReason, string> = {
  harassment: "Lenguaje ofensivo o acoso",
  cheating: "Trampas o uso de hacks",
  inappropriate_name: "Nombre o contenido inapropiado",
  spam: "Spam o estafa",
  other: "Otro",
};
