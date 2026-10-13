// Qué tan buena es una contraseña, para el medidor del registro (0 a 4 barras). Solo orienta: el backend pide
// mínimo 8 caracteres y nada más
const LABELS = ["Mínimo 8 caracteres.", "Débil", "Aceptable", "Buena", "Muy buena"];

export function passwordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 14) score++;
  return { score, label: password ? LABELS[score] : LABELS[0] };
}
