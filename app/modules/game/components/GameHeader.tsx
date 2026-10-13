// Cabecera de la pantalla del juego: logo, tu avatar con nombre y nivel (abre tu perfil), ajustes y salir.
import { useAuthStore } from "@/modules/auth/store";
import { useProfileStore } from "@/modules/profile/store";
import { useSettingsStore } from "@/modules/settings/store";

// Ref de callback fuera del componente (siempre la misma): al aparecer la cabecera, carga tu nivel
function loadMeOnMount(element: HTMLElement | null) {
  if (element) void useProfileStore.getState().loadMe();
}

export function GameHeader() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const level = useProfileStore((s) => s.me?.level);
  if (!session) return null;

  return (
    <header
      ref={loadMeOnMount}
      className="flex h-16 shrink-0 items-center justify-between gap-3 border-b-[3px] border-cielo-profundo bg-cielo px-5"
    >
      <span className="logo text-3xl">Wild Revival</span>
      <nav className="flex items-center gap-1.5">
        <button
          onClick={() => useProfileStore.getState().show(session.id)}
          aria-label="Ver mi perfil"
          className="flex h-11 items-center gap-2.5 rounded-control pr-3 pl-1 text-left text-white hover:bg-cielo-profundo"
        >
          <span className="flex size-9 items-center justify-center rounded-control border-2 border-madera bg-arena text-ayuda font-extrabold text-madera">
            {session.dname.slice(0, 2).toUpperCase()}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-cuerpo font-extrabold">{session.dname}</span>
            {level !== undefined && (
              <span className="text-micro font-semibold text-nube">Nivel {level}</span>
            )}
          </span>
        </button>
        <button
          onClick={() => useSettingsStore.getState().show()}
          aria-label="Ajustes"
          className="flex size-11 items-center justify-center rounded-control text-white hover:bg-cielo-profundo"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
        <button onClick={logout} className="btn btn-compacto ml-1.5 bg-cielo-profundo text-white">
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
}
