// Lobby: por ahora muestra el jugador. La conexión la abre la ruta (routes/loaders.ts).
import { useNavigate } from "react-router";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAuthStore } from "@/modules/auth/store";
import { PlayerCard } from "../components/PlayerCard";
import { useLobbyStore } from "../store";

export function LobbyScreen() {
  const { status, player, error, disconnect } = useLobbyStore();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function exit() {
    disconnect();
    logout();
    navigate("/login");
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">Lobby</h1>
        <button onClick={exit} className="text-sm text-stone-400 hover:text-white">
          Salir
        </button>
      </header>
      {status === "connecting" && (
        <p className="text-stone-400">Conectando al servidor de juego…</p>
      )}
      {status === "closed" && (
        <ErrorMessage message="Se perdió la conexión con el servidor de juego." />
      )}
      <ErrorMessage message={error} />
      {player && <PlayerCard player={player} />}
    </main>
  );
}
