// Lo que corre antes de mostrar cada pantalla: protege rutas (sin useEffect).
import { redirect } from "react-router";
import { useAuthStore } from "@/modules/auth/store";
import { isTokenExpired } from "@/modules/auth/helpers/token";

// Solo con sesión iniciada y token vigente; si caducó, se cierra la sesión
export function requireSession() {
  const { session, logout } = useAuthStore.getState();
  if (session && !isTokenExpired(session.token)) return null;
  logout();
  return redirect("/login");
}
