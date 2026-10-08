import type { ReactNode } from "react";

type Props = { title: string; children: ReactNode; footer?: ReactNode };

/** Recuadro de los paneles laterales: título arriba, contenido con scroll y un pie opcional */
export function Panel({ title, children, footer }: Props) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded border border-stone-700 bg-stone-900">
      <h2 className="border-b border-stone-700 px-3 py-2 text-sm font-bold text-amber-400">
        {title}
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">{children}</div>
      {footer && <div className="border-t border-stone-700 p-2">{footer}</div>}
    </section>
  );
}
