import type { ReactNode } from "react";

type Props = {
  title: string;
  badge?: ReactNode;
  // Reemplaza la cabecera (p. ej. pestañas); el título queda solo para lectores de pantalla
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/** Panel blanco con cabecera (título y, opcional, una insignia), contenido con scroll y un pie opcional */
export function Panel({ title, badge, header, children, footer }: Props) {
  return (
    <section className="panel flex min-h-0 flex-1 flex-col">
      {header ? (
        <div className="flex border-b-2 border-borde bg-encabezado">
          <h2 className="sr-only">{title}</h2>
          {header}
        </div>
      ) : (
        <div className="panel-encabezado">
          <h2 className="panel-titulo">{title}</h2>
          {badge}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">{children}</div>
      {footer && <div className="flex gap-2 border-t-2 border-borde p-2.5">{footer}</div>}
    </section>
  );
}
