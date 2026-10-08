// Rutas de la app
import { createBrowserRouter, redirect } from "react-router";
import { AuthScreen } from "@/modules/auth/screens/AuthScreen";
import { LobbyScreen } from "@/modules/lobby/screens/LobbyScreen";
import { lobbyLoader } from "./loaders";

export const router = createBrowserRouter([
  { path: "/", loader: () => redirect("/login") },
  { path: "/login", element: <AuthScreen /> },
  { path: "/lobby", loader: lobbyLoader, element: <LobbyScreen /> },
]);
