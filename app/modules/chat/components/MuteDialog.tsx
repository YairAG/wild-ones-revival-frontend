// Modal para silenciar a un jugador: duración (5 min a 1 semana) y un motivo opcional que queda en el registro
// de moderación.
import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { MUTE_OPTIONS, useChatStore } from "../store";

function confirmMute(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  useChatStore.getState().mute(Number(data.get("minutes")), String(data.get("reason")).trim());
}

const close = () => useChatStore.getState().askMute(null);

export function MuteDialog() {
  const player = useChatStore((s) => s.muting);
  if (!player) return null;

  return (
    <Modal title={`Silenciar a ${player.dname}`} onClose={close}>
      <form onSubmit={confirmMute} className="flex flex-col gap-3.5">
        <fieldset className="flex flex-col gap-1.5">
          <legend className="etiqueta mb-1.5">¿Cuánto tiempo?</legend>
          <div className="grid grid-cols-2 gap-2">
            {MUTE_OPTIONS.map((option, i) => (
              <label
                key={option.minutes}
                className="btn btn-fila btn-secundario cursor-pointer has-checked:border-cielo-profundo has-checked:bg-cielo has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-foco"
              >
                <input
                  type="radio"
                  name="minutes"
                  value={option.minutes}
                  defaultChecked={i === 1}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col gap-1.5">
          <span className="etiqueta">Motivo (opcional)</span>
          <input name="reason" maxLength={100} autoComplete="off" className="campo" />
          <span className="ayuda">Solo lo ven los moderadores, en el registro.</span>
        </label>
        <div className="flex gap-2">
          <button className="btn btn-peligro flex-1">Silenciar</button>
          <button type="button" onClick={close} className="btn btn-secundario flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
