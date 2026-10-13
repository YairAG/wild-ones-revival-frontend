// Rutas de la app
import { createBrowserRouter, redirect } from "react-router";
import { ErrorScreen } from "@/components/ErrorScreen";
import { AuthScreen } from "@/modules/auth/screens/AuthScreen";
import { GameScreen } from "@/modules/game/screens/GameScreen";
import { LEGAL_DOCS } from "@/modules/legal/content";
import { LegalScreen } from "@/modules/legal/screens/LegalScreen";
import { redirectIfSession, requireSession } from "./loaders";

// Todas cuelgan de una ruta sin path solo para compartir la pantalla de error
export const router = createBrowserRouter([
  {
    errorElement: <ErrorScreen />,
    children: [
      { path: "/", loader: () => redirect("/login") },
      { path: "/login", loader: redirectIfSession, element: <AuthScreen /> },
      { path: "/play", loader: requireSession, element: <GameScreen /> },
      // Públicas: se abren con o sin sesión
      ...LEGAL_DOCS.map((doc) => ({ path: doc.path, element: <LegalScreen doc={doc} /> })),
    ],
  },
]);
