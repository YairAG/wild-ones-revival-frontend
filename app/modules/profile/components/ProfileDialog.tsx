// Modal del perfil de jugador (diseño "Perfil de jugador y reporte" del lienzo), en tres pasos: el perfil, el
// formulario de reporte y la confirmación.
import type { FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { presenceLabel } from "@/modules/friends/presence";
import { useProfileStore } from "../store";
import type { PlayerProfile, ReportReason } from "../types";

const REASONS: [ReportReason, string][] = [
  ["harassment", "Lenguaje ofensivo o acoso"],
  ["cheating", "Trampas o uso de hacks"],
  ["inappropriate_name", "Nombre o contenido inapropiado"],
  ["spam", "Spam o estafa"],
  ["other", "Otro"],
];

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

const close = () => useProfileStore.getState().hide();

export function ProfileDialog() {
  const { playerId, profile, step, notice } = useProfileStore();
  if (playerId === null) return null;

  return (
    <Modal title={profile ? `Perfil de ${profile.dname}` : "Perfil"} onClose={close} wide bare>
      {!profile && <p className="ayuda p-5">{notice ?? "Cargando..."}</p>}
      {profile && step === "profile" && <ProfileView profile={profile} notice={notice} />}
      {profile && step === "report" && <ReportForm profile={profile} notice={notice} />}
      {profile && step === "sent" && <ReportSent dname={profile.dname} />}
    </Modal>
  );
}

function CloseButton({ className }: { className: string }) {
  return (
    <button
      onClick={close}
      aria-label="Cerrar"
      className={`flex size-10 items-center justify-center rounded-control ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}

function ProfileView({ profile, notice }: { profile: PlayerProfile; notice: string | null }) {
  const { addFriend, invite, toggleBlock, setStep } = useProfileStore.getState();
  const { relation, presence } = profile;
  const isOnline = presence !== "offline";
  const stats: [string, number][] = [
    ["Partidas", profile.gamecount],
    ["Victorias", profile.wins],
    ["Amigos en común", profile.mutualFriends],
  ];

  return (
    <div>
      <div className="relative flex items-center gap-4 bg-cielo px-5.5 pt-5.5 pb-4.5 text-white">
        <span className="flex size-19 shrink-0 items-center justify-center rounded-control border-3 border-madera bg-arena font-display text-3xl text-madera">
          {profile.dname.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="truncate font-display text-[28px] leading-tight">{profile.dname}</h2>
          <span className="text-etiqueta flex items-center gap-2 font-bold">
            <span className={`estado ${isOnline ? "estado-en-linea" : "estado-desconectado"}`} />
            {presenceLabel[presence]}
          </span>
          <span className="text-ayuda font-semibold">Nivel {profile.level}</span>
        </div>
        <CloseButton className="absolute top-2.5 right-2.5 text-white" />
      </div>

      <div className="flex flex-col gap-4.5 px-5.5 py-5">
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-0.5 rounded-control bg-encabezado px-3 py-2.5"
            >
              <span className="text-ayuda font-bold text-texto-secundario">{label}</span>
              <span className="text-xl font-extrabold">{value}</span>
            </div>
          ))}
        </div>

        {profile.pets.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-etiqueta font-extrabold">Mascotas</span>
            <ul className="flex flex-wrap gap-2">
              {profile.pets.map((pet, i) => (
                <li
                  key={i}
                  className="text-ayuda rounded-control border-2 border-borde px-2.5 py-1 font-bold"
                >
                  {pet.name} <span className="text-texto-secundario">· {pet.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {notice && (
          <p role="status" className="ayuda font-bold">
            {notice}
          </p>
        )}

        {relation !== "self" && (
          <>
            <div className="flex gap-2">
              {relation === "none" && !profile.blocked && (
                <button onClick={addFriend} className="btn btn-primario flex-1">
                  Agregar amigo
                </button>
              )}
              {relation === "incoming" && (
                <button onClick={addFriend} className="btn btn-primario flex-1">
                  Aceptar solicitud
                </button>
              )}
              {relation === "outgoing" && (
                <button disabled className="btn flex-1">
                  Solicitud enviada
                </button>
              )}
              {relation === "friends" && (
                // Solo se puede invitar a quien está en el lobby del juego
                <button
                  onClick={invite}
                  disabled={presence !== "lobby"}
                  className="btn btn-secundario flex-1"
                >
                  Invitar
                </button>
              )}
            </div>
            <div className="flex justify-end gap-1.5 border-t-2 border-divisor pt-3">
              <button
                onClick={toggleBlock}
                className="btn btn-fila btn-texto text-texto-secundario"
              >
                {profile.blocked ? "Desbloquear" : "Bloquear"}
              </button>
              <button
                onClick={() => setStep("report")}
                className="btn btn-fila btn-texto text-error"
              >
                Reportar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function sendReport(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const reason = data.get("reason") as ReportReason | null;
  if (!reason) return; // el botón está deshabilitado hasta elegir motivo
  void useProfileStore
    .getState()
    .report(reason, String(data.get("details")).trim(), data.get("block") === "on");
}

function ReportForm({ profile, notice }: { profile: PlayerProfile; notice: string | null }) {
  const message = useProfileStore((s) => s.message);
  const back = () => useProfileStore.getState().setStep("profile");

  return (
    <form onSubmit={sendReport}>
      <div className="flex items-center gap-2.5 border-b-2 border-borde bg-encabezado px-4.5 py-3.5">
        <button
          type="button"
          onClick={back}
          aria-label="Volver al perfil"
          className="flex size-9 items-center justify-center rounded-control text-cielo-profundo"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 className="font-display text-[22px]">Reportar a {profile.dname}</h2>
      </div>

      <div className="flex flex-col gap-3.5 px-5.5 py-4.5">
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-etiqueta mb-2 font-extrabold">¿Qué pasó?</legend>
          {REASONS.map(([value, label]) => (
            <label
              key={value}
              className="text-etiqueta flex min-h-11 cursor-pointer items-center gap-3 rounded-control border-2 border-borde-suave px-3 font-bold has-checked:border-cielo has-checked:bg-nube"
            >
              <input
                type="radio"
                name="reason"
                value={value}
                required
                className="size-4.5 accent-cielo-profundo"
              />
              {label}
            </label>
          ))}
        </fieldset>

        {message && (
          <div className="flex flex-col gap-1.5">
            <span className="text-ayuda font-extrabold text-texto-secundario">
              Se adjuntará automáticamente
            </span>
            <p className="text-ayuda rounded-control border-2 border-borde-suave bg-encabezado px-3 py-2 text-texto-cuerpo [overflow-wrap:anywhere]">
              <span className="chat-hora">{time(message.at)}</span>
              <b>{profile.dname}:</b> {message.text}
            </p>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-etiqueta font-extrabold">
            Detalles <span className="font-semibold text-texto-secundario">(opcional)</span>
          </span>
          <textarea name="details" rows={3} maxLength={300} className="campo h-auto py-2.5" />
        </label>

        {!profile.blocked && (
          <label className="text-etiqueta flex items-center gap-2.5 font-bold text-texto-cuerpo">
            <input type="checkbox" name="block" className="size-4.5 accent-foco" />
            Bloquear también a {profile.dname}
          </label>
        )}

        {notice && (
          <p role="alert" className="ayuda-error">
            {notice}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2.5 border-t-2 border-borde bg-encabezado px-4.5 py-3.5">
        <button type="button" onClick={back} className="btn btn-secundario">
          Cancelar
        </button>
        <button className="btn border-error bg-error text-white">Enviar reporte</button>
      </div>
    </form>
  );
}

function ReportSent({ dname }: { dname: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-7 pt-8 pb-6.5 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-exito-fondo text-exito-texto">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h2 className="font-display text-2xl">Reporte enviado</h2>
      <p className="text-cuerpo max-w-sm text-texto-cuerpo">
        Moderación lo revisará. {dname} no sabrá quién lo reportó.
      </p>
      <button onClick={close} className="btn btn-primario mt-2">
        Volver al juego
      </button>
    </div>
  );
}
