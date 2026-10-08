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
    <div className="flex min-h-screen flex-col xl:h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b-[3px] border-cielo-profundo bg-cielo px-5">
        <span className="logo text-3xl">Wild Revival</span>
        <nav className="flex items-center gap-3">
          {/* Avatar con las iniciales y el nombre */}
          <span className="flex items-center gap-2.5 text-white">
            <span className="flex size-9 items-center justify-center rounded-control border-2 border-madera bg-arena text-ayuda font-extrabold text-madera">
              {session?.dname.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-cuerpo font-extrabold">{session?.dname}</span>
          </span>
          <button onClick={exit} className="btn btn-compacto bg-cielo-profundo text-white">
            Cerrar sesión
          </button>
        </nav>
      </header>
      <ErrorMessage message={error} />
      {/* Pantalla ancha (xl): amigos y notas | juego | chat, sin scroll.
          Más angosta: el juego arriba y los paneles abajo (en dos columnas desde md), con scroll de página */}
      <main className="grid gap-4 p-4 md:grid-cols-2 xl:flex xl:min-h-0 xl:flex-1">
        <aside className="flex h-[32rem] min-w-0 flex-col gap-4 xl:h-auto xl:flex-1">
          <FriendsPanel />
          <ChangelogPanel />
        </aside>
        {/* El escenario del SWF mide 760 x 740: el reproductor tiene esa proporción. En xl usa toda la altura;
            si no, todo el ancho, pero sin pasar del alto de la ventana (menos el encabezado y márgenes) */}
        <div
          ref={gameContainer}
          className="order-first mx-auto aspect-[760/740] w-[min(100%,calc((100svh_-_7rem)*760/740))] marco-juego overflow-hidden md:col-span-2 xl:order-none xl:mx-0 xl:h-full xl:w-auto xl:max-w-full"
        />
        <aside className="flex h-[32rem] min-w-0 flex-col xl:h-auto xl:flex-1">
          <GlobalChatPanel />
        </aside>
      </main>
    </div>
  );
}
