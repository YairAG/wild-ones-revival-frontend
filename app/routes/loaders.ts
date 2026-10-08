// Lo que corre antes de mostrar cada pantalla: protege rutas (sin useEffect).
import { redirect } from "react-router";
import { useAuthStore } from "@/modules/auth/store";

// Solo con sesión iniciada
export function requireSession() {
  return useAuthStore.getState().session ? null : redirect("/login");
}
