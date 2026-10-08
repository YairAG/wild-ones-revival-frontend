// El juego original (lobby, sala de espera, partidas) corriendo en Ruffle.
import { useNavigate } from "react-router";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAuthStore } from "@/modules/auth/store";
import { ChangelogPanel } from "@/modules/changelog/components/ChangelogPanel";
import { GlobalChatPanel } from "@/modules/chat/components/GlobalChatPanel";
import { FriendsPanel } from "@/modules/friends/components/FriendsPanel";
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
    <main className="flex min-h-screen flex-col xl:h-screen">
      <header className="flex items-center justify-between bg-stone-900 px-4 py-2">
        <h1 className="font-bold text-amber-400">Wild Ones Revival</h1>
        <span className="text-sm text-stone-400">{session?.dname}</span>
        <button onClick={exit} className="text-sm text-stone-400 hover:text-white">
          Salir
        </button>
      </header>
      <ErrorMessage message={error} />
      {/* Pantalla ancha (xl): paneles | juego | paneles, sin scroll.
          Más angosta: el juego arriba y los paneles abajo (en dos columnas desde md), con scroll de página */}
      <div className="grid md:grid-cols-2 xl:flex xl:min-h-0 xl:flex-1">
        <aside className="flex h-[32rem] min-w-0 flex-col gap-3 p-3 xl:h-auto xl:flex-1">
          <ChangelogPanel />
          <GlobalChatPanel />
        </aside>
        {/* El escenario del SWF mide 760 x 740: el reproductor tiene esa proporción. En xl usa toda la altura;
            si no, todo el ancho, pero sin pasar del alto de la ventana (menos el encabezado) */}
        <div
          ref={gameContainer}
          className="order-first mx-auto aspect-[760/740] w-[min(100%,calc((100svh_-_2.5rem)*760/740))] bg-[#B2D2F6] md:col-span-2 xl:order-none xl:mx-0 xl:h-full xl:w-auto xl:max-w-full"
        />
        <aside className="flex h-[32rem] min-w-0 flex-col p-3 xl:h-auto xl:flex-1">
          <FriendsPanel />
        </aside>
      </div>
    </main>
  );
}
