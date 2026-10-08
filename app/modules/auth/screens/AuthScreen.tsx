// Pantalla de inicio: entrar o crear cuenta, con el último parche al lado.
import { useNavigate } from "react-router";
import { Scene } from "@/components/Scene";
import { LatestReleaseCard } from "@/modules/changelog/components/LatestReleaseCard";
import { AuthForm } from "../components/AuthForm";
import { useAuthStore } from "../store";

export function AuthScreen() {
  const { mode, toggleMode } = useAuthStore();
  const navigate = useNavigate();
  const isLogin = mode === "login";

  return (
    <Scene>
      <main className="relative flex flex-1 flex-col items-center justify-center gap-7 px-4 pt-12 pb-36">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="logo text-6xl sm:text-[84px]">Wild Revival</span>
          <span className="text-cuerpo font-bold text-cielo-profundo">
            el clásico Wild Ones, mantenido por la comunidad
          </span>
        </div>

        <div className="flex w-full max-w-[820px] flex-wrap items-start justify-center gap-6">
          <section className="flex max-w-[400px] flex-[1_1_340px] flex-col gap-4 rounded-modal border-2 border-cielo-profundo bg-panel p-6 shadow-nivel-2">
            <div className="flex flex-col gap-1">
              <h1 className="text-titulo font-display">
                {isLogin ? "Iniciar sesión" : "Crear cuenta"}
              </h1>
              {!isLogin && (
                <p className="text-etiqueta text-texto-secundario">
                  Tu nombre de usuario es lo que verán los demás en el chat y en partida.
                </p>
              )}
            </div>
            <AuthForm onSuccess={() => navigate("/play")} />
            <p className="text-etiqueta pt-1 text-center font-bold">
              {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
              <button
                onClick={toggleMode}
                className="font-extrabold text-enlace hover:text-enlace-hover"
              >
                {isLogin ? "Crear cuenta" : "Inicia sesión"}
              </button>
            </p>
          </section>

          <div className="flex max-w-[400px] flex-[1_1_340px] flex-col gap-4">
            <LatestReleaseCard />
          </div>
        </div>
      </main>

      <footer className="relative px-6 pt-3.5 pb-4.5 text-ayuda font-semibold text-texto">
        Proyecto sin fines de lucro. No afiliado a los dueños originales del juego.
      </footer>
    </Scene>
  );
}
