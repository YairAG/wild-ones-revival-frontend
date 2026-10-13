// Ventana modal del sistema de diseño (.modal) sobre un fondo oscuro. Usa el <dialog> del navegador: atrapa
// el foco, bloquea lo de atrás y se cierra con Esc (entonces llama a onClose). Se abre al montarse y se
// cierra al desmontarse, así que se muestra con un simple {abierto && <Modal ... />}.
import { useId, type ReactNode } from "react";

type Props = { title: string; onClose(): void; children: ReactNode; wide?: boolean };

// Ref de callback fuera del componente (siempre la misma): abre el diálogo cuando aparece
function openOnMount(dialog: HTMLDialogElement | null) {
  if (dialog && !dialog.open) dialog.showModal();
}

export function Modal({ title, onClose, children, wide }: Props) {
  const titleId = useId();
  return (
    <dialog
      ref={openOnMount}
      onClose={onClose}
      aria-labelledby={titleId}
      className={`modal m-auto w-[calc(100%-2rem)] p-0 text-texto backdrop:bg-[rgb(22_38_48/0.6)] ${wide ? "max-w-xl" : "max-w-sm"}`}
    >
      <div className="flex flex-col gap-3.5 p-5">
        <h2 id={titleId} className="panel-titulo">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
