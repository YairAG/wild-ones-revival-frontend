// Ventana modal del sistema de diseño (.modal) sobre un fondo oscuro. Usa el <dialog> del navegador: atrapa
// el foco y bloquea lo de atrás; con Esc llama a onClose (y quien lo muestra lo quita). Se abre al montarse y se
// cierra al desmontarse, así que se muestra con un simple {abierto && <Modal ... />}.
// `bare`: el contenido trae su propio encabezado y márgenes (p. ej. el perfil, con su franja azul); el título
// queda solo para lectores de pantalla.
import { useId, type ReactNode } from "react";

type Props = {
  title: string;
  onClose(): void;
  children: ReactNode;
  wide?: boolean;
  bare?: boolean;
};

// Ref de callback fuera del componente (siempre la misma): abre el diálogo cuando aparece
function openOnMount(dialog: HTMLDialogElement | null) {
  if (dialog && !dialog.open) dialog.showModal();
}

export function Modal({ title, onClose, children, wide, bare }: Props) {
  const titleId = useId();
  return (
    <dialog
      ref={openOnMount}
      // Esc: lo cierra React (quitando el modal) en vez del navegador, que avisaría después con "close"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby={bare ? undefined : titleId}
      aria-label={bare ? title : undefined}
      // Nunca más alto que la ventana: si no cabe, se desplaza. open:flex (no flex): cerrado tiene que seguir oculto
      className={`modal m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] overflow-y-auto p-0 open:flex open:flex-col text-texto backdrop:bg-[rgb(22_38_48/0.6)] ${wide ? "max-w-xl" : "max-w-sm"}`}
    >
      {bare ? (
        children
      ) : (
        <div className="flex flex-col gap-3.5 p-5">
          <h2 id={titleId} className="panel-titulo">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
