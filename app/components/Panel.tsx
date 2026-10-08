import type { ReactNode } from "react";

type Props = { title: string; badge?: ReactNode; children: ReactNode; footer?: ReactNode };

/** Panel blanco con cabecera (título y, opcional, una insignia), contenido con scroll y un pie opcional */
export function Panel({ title, badge, children, footer }: Props) {
  return (
    <section className="panel flex min-h-0 flex-1 flex-col">
      <div className="panel-encabezado">
        <h2 className="panel-titulo">{title}</h2>
        {badge}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">{children}</div>
      {footer && <div className="flex gap-2 border-t-2 border-borde p-2.5">{footer}</div>}
    </section>
  );
}
