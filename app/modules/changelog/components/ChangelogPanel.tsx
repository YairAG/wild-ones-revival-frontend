import { Panel } from "@/components/Panel";
import { releases } from "../mocks";

export function ChangelogPanel() {
  return (
    <Panel title="Notas de cambios">
      {releases.map((release) => (
        <article key={release.date} className="mb-4">
          <p className="text-xs text-stone-500">{release.date}</p>
          <h3 className="font-semibold text-white">{release.title}</h3>
          <ul className="mt-1 list-disc pl-4 text-sm text-stone-300">
            {release.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </article>
      ))}
    </Panel>
  );
}
