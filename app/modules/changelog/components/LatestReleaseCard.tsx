import { releases } from "../mocks";

/** La última versión, para la pantalla de entrada */
export function LatestReleaseCard() {
  const [latest] = releases;
  return (
    <section
      aria-labelledby="ultimo-parche"
      className="overflow-hidden rounded-md border-2 border-line bg-panel"
    >
      <div className="flex items-center justify-between border-b-2 border-line bg-panel-head px-3.5 py-2.5">
        <h2 id="ultimo-parche" className="font-title text-[19px] font-normal">
          Último parche
        </h2>
        <span className="rounded-sm bg-sand px-2 py-0.5 text-[11px] font-extrabold text-on-action">
          NUEVO
        </span>
      </div>
      <div className="flex flex-col gap-2 p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[15px] font-extrabold">{latest.title}</span>
          <span className="text-xs font-semibold whitespace-nowrap text-muted">{latest.date}</span>
        </div>
        <ul className="list-disc pl-4.5 text-sm leading-relaxed text-body">
          {latest.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
