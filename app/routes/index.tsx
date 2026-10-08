// Rutas de la app
import { createBrowserRouter, redirect } from "react-router";
import { AuthScreen } from "@/modules/auth/screens/AuthScreen";
import { GameScreen } from "@/modules/game/screens/GameScreen";
import { requireSession } from "./loaders";

export const router = createBrowserRouter([
  { path: "/", loader: () => redirect("/login") },
  { path: "/login", element: <AuthScreen /> },
  { path: "/play", loader: requireSession, element: <GameScreen /> },
]);
