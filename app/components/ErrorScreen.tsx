// Pantalla para cuando algo de la app truena al dibujarse o la ruta no existe (errorElement de las rutas): en
// lugar de la página técnica de React Router, un aviso con el estilo del juego. El detalle va a la consola.
import { isRouteErrorResponse, useRouteError } from "react-router";
import { Scene } from "./Scene";

export function ErrorScreen() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (!notFound) console.error(error);

  return (
    <Scene>
      <main className="relative flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-36">
        <span className="logo text-5xl">Wild Revival</span>
        <section
          role="alert"
          className="flex w-full max-w-sm flex-col gap-2.5 rounded-modal border-2 border-cielo-profundo bg-panel p-5 shadow-nivel-2"
        >
          <h1 className="panel-titulo">{notFound ? "Esa página no existe" : "Algo salió mal"}</h1>
          <p className="text-cuerpo text-texto-cuerpo">
            {notFound
              ? "Revisa la dirección o vuelve al inicio."
              : "La página tuvo un error. Recárgala para seguir jugando."}
          </p>
          {notFound ? (
            <a href="/" className="btn btn-primario mt-1">
              Ir al inicio
            </a>
          ) : (
            <button onClick={() => location.reload()} className="btn btn-primario mt-1">
              Recargar
            </button>
          )}
        </section>
      </main>
    </Scene>
  );
}
