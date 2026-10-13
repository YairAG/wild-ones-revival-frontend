// El juego original (lobby, sala de espera, partidas) corriendo en Ruffle.
import { Navigate } from "react-router";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAuthStore } from "@/modules/auth/store";
import { ChangelogPanel } from "@/modules/changelog/components/ChangelogPanel";
import { GlobalChatPanel } from "@/modules/chat/components/GlobalChatPanel";
import { FriendsPanel } from "@/modules/friends/components/FriendsPanel";
import { InviteToast } from "@/modules/invites/components/InviteToast";
import { ProfileDialog } from "@/modules/profile/components/ProfileDialog";
import { SettingsDialog } from "@/modules/settings/components/SettingsDialog";
import { ConnectionLost } from "../components/ConnectionLost";
import { GameBar } from "../components/GameBar";
import { GameHeader } from "../components/GameHeader";
import { useGameStore } from "../store";

// Ref de callback: React la llama cuando el div aparece y la función que devuelve cuando se va.
// Está fuera del componente para ser siempre la misma: si se recreara en cada render, React
// desmontaría y volvería a montar el juego cada vez que cambia el estado.
function gameContainer(container: HTMLDivElement | null) {
  const session = useAuthStore.getState().session;
  if (container && session) useGameStore.getState().mount(container, session.dname);
  return () => useGameStore.getState().unmount();
}

export function GameScreen() {
  const session = useAuthStore((s) => s.session);
  const error = useGameStore((s) => s.error);
  const focus = useGameStore((s) => s.focus);

  // Sin sesión (cerró sesión o expiró) vuelve al login. Al desmontarse esta pantalla, las refs de callback
  // cierran el juego y las conexiones
  if (!session) return <Navigate to="/login" replace />;

  // En modo enfoque los paneles solo se ocultan (no se quitan): el chat y amigos siguen conectados
  const panel = focus ? "hidden" : "";

  return (
    <div className="flex min-h-screen flex-col xl:h-screen">
      <GameHeader />
      <ErrorMessage message={error} />
      <InviteToast />
      <ProfileDialog />
      <SettingsDialog />
      {/* Pantalla ancha (xl): amigos y notas | juego | chat, sin scroll.
          Más angosta: el juego arriba y los paneles abajo (en dos columnas desde md), con scroll de página */}
      <main className="grid gap-4 p-4 md:grid-cols-2 xl:flex xl:min-h-0 xl:flex-1">
        <aside className={`flex h-[32rem] min-w-0 flex-col gap-4 xl:h-auto xl:flex-1 ${panel}`}>
          <FriendsPanel />
          <ChangelogPanel />
        </aside>
        {/* El escenario del SWF mide 760 x 555 (recortado en scripts/build-swf.ts): el recuadro tiene esa
            proporción. Usa todo el ancho, pero sin pasar del alto de la ventana (menos encabezado, márgenes y
            la barra de abajo); en xl además deja 18rem a cada panel, salvo en modo enfoque */}
        <div
          className={`order-first mx-auto flex w-[min(100%,calc((100svh_-_10rem)*760/555))] flex-col gap-2 md:col-span-2 xl:order-none xl:shrink-0 xl:self-center ${focus ? "xl:mx-auto" : "xl:mx-0 xl:w-[min(calc(100%_-_38rem),calc((100svh_-_10rem)*760/555))]"}`}
        >
          {/* Adentro, Ruffle y encima el aviso de conexión perdida */}
          <div className="relative aspect-[760/555] w-full marco-juego overflow-hidden">
            <div ref={gameContainer} className="size-full" />
            <ConnectionLost />
          </div>
          <GameBar />
        </div>
        <aside className={`flex h-[32rem] min-w-0 flex-col xl:h-auto xl:flex-1 ${panel}`}>
          <GlobalChatPanel />
        </aside>
      </main>
    </div>
  );
}
