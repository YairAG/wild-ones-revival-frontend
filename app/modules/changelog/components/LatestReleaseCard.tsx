import { releases } from "../mocks";

/** La última versión, para la pantalla de entrada */
export function LatestReleaseCard() {
  const [latest] = releases;
  return (
    <section aria-labelledby="ultimo-parche" className="panel">
      <div className="panel-encabezado">
        <h2 id="ultimo-parche" className="panel-titulo">
          Último parche
        </h2>
        <span className="insignia insignia-nuevo">NUEVO</span>
      </div>
      <div className="flex flex-col gap-2 p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-cuerpo font-extrabold">{latest.title}</span>
          <span className="text-ayuda font-semibold whitespace-nowrap text-texto-secundario">
            {latest.date}
          </span>
        </div>
        <ul className="text-etiqueta list-disc pl-4.5 leading-relaxed text-texto-cuerpo">
          {latest.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
