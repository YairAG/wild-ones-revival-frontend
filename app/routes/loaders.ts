// Lo que corre antes de mostrar cada pantalla: protege rutas y dispara conexiones (sin useEffect).
import { redirect } from "react-router";
import { useAuthStore } from "@/modules/auth/store";
import { useLobbyStore } from "@/modules/lobby/store";

export function lobbyLoader() {
  const session = useAuthStore.getState().session;
  if (!session) return redirect("/login");
  useLobbyStore.getState().connect(session.token); // sin await: la pantalla muestra "Conectando…"
  return null;
}
