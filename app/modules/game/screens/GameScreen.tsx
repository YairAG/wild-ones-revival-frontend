// El juego original (lobby, sala de espera, partidas) corriendo en Ruffle.
import { useNavigate } from "react-router";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAuthStore } from "@/modules/auth/store";
import { useGameStore } from "../store";

// Ref de callback: React la llama cuando el div aparece y la función que devuelve cuando se va.
// Está fuera del componente para ser siempre la misma: si se recreara en cada render, React
// desmontaría y volvería a montar el juego cada vez que cambia el estado.
function gameContainer(container: HTMLDivElement | null) {
  const session = useAuthStore.getState().session;
  if (container && session) useGameStore.getState().mount(container, session.dname, session.token);
  return () => useGameStore.getState().unmount();
}

export function GameScreen() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const error = useGameStore((s) => s.error);
  const navigate = useNavigate();

  function exit() {
    useGameStore.getState().unmount();
    logout();
    navigate("/login");
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center justify-between bg-stone-900 px-4 py-2">
        <h1 className="font-bold text-amber-400">Wild Ones Revival</h1>
        <span className="text-sm text-stone-400">{session?.dname}</span>
        <button onClick={exit} className="text-sm text-stone-400 hover:text-white">
          Salir
        </button>
      </header>
      <ErrorMessage message={error} />
      <div ref={gameContainer} className="flex-1 bg-[#B2D2F6]" />
    </main>
  );
}
