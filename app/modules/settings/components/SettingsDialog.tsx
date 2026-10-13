// Modal de ajustes. Todavía sin opciones: avisa qué viene.
import { Modal } from "@/components/Modal";
import { useSettingsStore } from "../store";

export function SettingsDialog() {
  const { open, hide } = useSettingsStore();
  if (!open) return null;

  return (
    <Modal title="Ajustes" onClose={hide}>
      <p className="text-cuerpo text-texto-cuerpo">
        Muy pronto: calidad gráfica, volumen de música y efectos, opciones del chat y de tu cuenta.
      </p>
      <button onClick={hide} className="btn btn-secundario">
        Cerrar
      </button>
    </Modal>
  );
}
