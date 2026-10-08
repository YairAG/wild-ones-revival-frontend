import type { ReactNode } from "react";

type Props = { title: string; badge?: ReactNode; children: ReactNode; footer?: ReactNode };

/** Panel blanco con cabecera (título y, opcional, una insignia), contenido con scroll y un pie opcional */
export function Panel({ title, badge, children, footer }: Props) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border-2 border-line bg-panel">
      <div className="flex items-center justify-between border-b-2 border-line bg-panel-head px-3.5 py-2.5">
        <h2 className="font-title text-[19px] font-normal">{title}</h2>
        {badge}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">{children}</div>
      {footer && <div className="flex gap-2 border-t-2 border-line p-2.5">{footer}</div>}
    </section>
  );
}
