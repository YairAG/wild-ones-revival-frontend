// Lo que corre antes de mostrar cada pantalla: protege rutas (sin useEffect).
// La sesión no se guarda en el navegador: al abrir la página se recupera con la cookie (restore → /refresh).
import { redirect } from "react-router";
import { useAuthStore } from "@/modules/auth/store";

// El juego, solo con sesión
export async function requireSession() {
  return (await useAuthStore.getState().restore()) ? null : redirect("/login");
}

// El login, solo sin sesión: si la cookie sigue vigente, directo al juego. Si la sesión acaba de expirar (el
// login muestra el aviso) no se intenta: así no rebota entre /play y /login
export async function redirectIfSession() {
  const { error, restore } = useAuthStore.getState();
  return !error && (await restore()) ? redirect("/play") : null;
}
