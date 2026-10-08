import { Panel } from "@/components/Panel";
import { releases } from "../mocks";

export function ChangelogPanel() {
  return (
    <Panel title="Notas de parche">
      <div className="flex flex-col gap-3">
        {releases.map((release, i) => (
          <article key={release.date} className="flex flex-col gap-1">
            {i > 0 && <div className="mb-2 h-0.5 bg-divisor" />}
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-cuerpo font-extrabold">{release.title}</h3>
              <span className="text-ayuda font-semibold whitespace-nowrap text-texto-secundario">
                {release.date}
              </span>
            </div>
            <ul className="text-etiqueta list-disc pl-4.5 leading-relaxed text-texto-cuerpo">
              {release.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Panel>
  );
}
