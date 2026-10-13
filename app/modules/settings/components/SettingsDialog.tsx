// Modal de ajustes (diseño "Ajustes" del lienzo): pestañas Juego, Audio, Chat y Cuenta. Las preferencias se
// aplican y guardan al momento (en este navegador); las acciones de la cuenta van al backend.
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { useAuthStore } from "@/modules/auth/store";
import { useFriendsStore } from "@/modules/friends/store";
import { useSettingsStore } from "../store";
import type { DmPolicy, Quality, SettingsTab } from "../types";

const TABS: [SettingsTab, string][] = [
  ["game", "Juego"],
  ["audio", "Audio"],
  ["chat", "Chat"],
  ["account", "Cuenta"],
];
const QUALITIES: [Quality, string][] = [
  ["low", "Baja"],
  ["medium", "Media"],
  ["high", "Alta"],
];

const settings = () => useSettingsStore.getState();

export function SettingsDialog() {
  const { open, tab, hide, setTab } = useSettingsStore();
  if (!open) return null;

  return (
    <Modal title="Ajustes" onClose={hide} wide bare>
      <div className="flex items-center justify-between border-b-2 border-borde bg-encabezado py-3 pr-3 pl-5">
        <h2 className="font-display text-titulo">Ajustes</h2>
        <button
          onClick={hide}
          aria-label="Cerrar ajustes"
          className="flex size-10 items-center justify-center rounded-control text-cielo-profundo"
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
      </div>

      <div className="flex flex-col sm:min-h-96 sm:flex-row">
        {/* En celular las pestañas van arriba en fila; desde sm, a la izquierda */}
        <nav className="flex gap-1 border-b-2 border-divisor p-2.5 sm:w-40 sm:flex-col sm:border-r-2 sm:border-b-0">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id}
              className={`text-cuerpo h-11 flex-1 rounded-control px-3.5 text-left font-extrabold sm:flex-none ${tab === id ? "bg-cielo text-white" : "text-texto-cuerpo hover:bg-encabezado"}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex max-h-[60svh] flex-1 flex-col gap-5.5 overflow-y-auto px-6 py-5.5">
          {tab === "game" && <GameTab />}
          {tab === "audio" && <AudioTab />}
          {tab === "chat" && <ChatTab />}
          {tab === "account" && <AccountTab />}
        </div>
      </div>
    </Modal>
  );
}

/** Interruptor encendido / apagado con su nombre y ayuda */
function Switch(props: { label: string; help?: string; on: boolean; onChange(on: boolean): void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex flex-col gap-0.5">
        <span className="text-cuerpo font-extrabold">{props.label}</span>
        {props.help && <span className="ayuda">{props.help}</span>}
      </span>
      <button
        role="switch"
        aria-checked={props.on}
        aria-label={props.label}
        onClick={() => props.onChange(!props.on)}
        className={`flex h-7 w-12 shrink-0 rounded-full border-2 border-cielo-profundo p-0.5 ${props.on ? "justify-end bg-naranja" : "justify-start bg-borde-suave"}`}
      >
        <span className="size-5 rounded-full border-2 border-cielo-profundo bg-panel" />
      </button>
    </div>
  );
}

function GameTab() {
  const quality = useSettingsStore((s) => s.preferences.quality);
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-cuerpo font-extrabold">Calidad gráfica</span>
      <div className="flex self-start overflow-hidden rounded-control border-2 border-borde">
        {QUALITIES.map(([value, label]) => (
          <button
            key={value}
            onClick={() => settings().setPreference("quality", value)}
            aria-pressed={quality === value}
            className={`text-etiqueta h-10 px-5 font-extrabold ${quality === value ? "bg-cielo text-white" : "bg-panel text-texto-cuerpo"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="ayuda">
        Baja quita el suavizado y ayuda en equipos lentos. Al cambiarla, el juego se vuelve a
        cargar.
      </span>
    </div>
  );
}

function AudioTab() {
  const { volume, muteInBackground } = useSettingsStore((s) => s.preferences);
  return (
    <>
      <label className="flex flex-col gap-2">
        <span className="text-cuerpo flex justify-between font-extrabold">
          <span>Volumen</span>
          <span className="text-texto-secundario">{volume}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => settings().setPreference("volume", Number(e.target.value))}
          className="w-full accent-naranja"
        />
        <span className="ayuda">La música y los efectos se ajustan dentro del juego.</span>
      </label>
      <Switch
        label="Silenciar en segundo plano"
        help="Si cambias de pestaña, el juego se calla."
        on={muteInBackground}
        onChange={(on) => settings().setPreference("muteInBackground", on)}
      />
    </>
  );
}

const DM_POLICIES: [DmPolicy, string][] = [
  ["friends", "Solo amigos"],
  ["everyone", "Todos"],
  ["nobody", "Nadie"],
];

function ChatTab() {
  const { showChatTime, highlightMentions } = useSettingsStore((s) => s.preferences);
  const dmPolicy = useSettingsStore((s) => s.dmPolicy);
  const notice = useSettingsStore((s) => s.notice);
  const { list, unblock } = useFriendsStore();
  return (
    <>
      <label className="flex flex-col gap-2">
        <span className="text-cuerpo font-extrabold">Quién puede escribirme en privado</span>
        <select
          value={dmPolicy ?? ""}
          disabled={!dmPolicy}
          onChange={(e) => void settings().setDmPolicy(e.target.value as DmPolicy)}
          className="campo max-w-72"
        >
          {!dmPolicy && <option value="">Cargando...</option>}
          {DM_POLICIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {notice && !notice.ok && <span className="ayuda-error">{notice.text}</span>}
      </label>
      <Switch
        label="Resaltar menciones"
        help="Cuando alguien escribe tu @usuario en el chat global."
        on={highlightMentions}
        onChange={(on) => settings().setPreference("highlightMentions", on)}
      />
      <Switch
        label="Mostrar hora en mensajes"
        on={showChatTime}
        onChange={(on) => settings().setPreference("showChatTime", on)}
      />
      <section className="flex flex-col gap-1">
        <span className="text-cuerpo font-extrabold">Jugadores bloqueados</span>
        <span className="ayuda">
          No ves sus mensajes y no pueden mandarte solicitudes ni invitarte.
        </span>
        {list.blocked.length === 0 && <p className="ayuda mt-1">No tienes jugadores bloqueados.</p>}
        {list.blocked.map((player) => (
          <div key={player.id} className="flex min-h-11 items-center justify-between gap-2">
            <span className="text-cuerpo font-bold">{player.dname}</span>
            <button onClick={() => unblock(player.id)} className="btn btn-fila btn-texto">
              Desbloquear
            </button>
          </div>
        ))}
      </section>
    </>
  );
}

async function changePassword(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const data = new FormData(form);
  if (await settings().changePassword(String(data.get("current")), String(data.get("next")))) {
    form.reset();
  }
}

function deleteAccount(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  void settings().deleteAccount(String(new FormData(e.currentTarget).get("password")));
}

function AccountTab() {
  const dname = useAuthStore((s) => s.session?.dname);
  const notice = useSettingsStore((s) => s.notice);
  // Eliminar pide confirmar: primero se muestra el formulario con la contraseña
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Al abrir o cerrar la confirmación se borra la respuesta anterior (era de otra acción)
  const confirmDelete = (on: boolean) => {
    setConfirmingDelete(on);
    useSettingsStore.setState({ notice: null });
  };
  const message = notice && (
    <p role="status" className={`w-full ${notice.ok ? "ayuda font-bold" : "ayuda-error"}`}>
      {notice.text}
    </p>
  );

  return (
    <>
      <label className="flex flex-col gap-1.5">
        <span className="text-etiqueta font-extrabold">Usuario</span>
        <input value={dname} disabled className="campo max-w-72" />
      </label>

      <form onSubmit={changePassword} className="flex flex-col gap-2.5">
        <span className="text-cuerpo font-extrabold">Cambiar contraseña</span>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <input
            name="current"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Contraseña actual"
            aria-label="Contraseña actual"
            className="campo"
          />
          <input
            name="next"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Nueva (mínimo 8)"
            aria-label="Contraseña nueva"
            className="campo"
          />
        </div>
        <button className="btn btn-secundario self-start">Cambiar contraseña</button>
      </form>

      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => void settings().logoutOthers()}
          className="btn btn-secundario self-start"
        >
          Cerrar sesión en otros equipos
        </button>
        <span className="ayuda">Este navegador sigue con la sesión abierta.</span>
      </div>

      {/* La respuesta sale junto a lo que la causó: aquí, o abajo si se está eliminando la cuenta */}
      {!confirmingDelete && message}

      <div className="flex flex-col gap-2.5 border-t-2 border-divisor pt-4.5">
        <span className="flex flex-col gap-0.5">
          <span className="text-cuerpo font-extrabold">Eliminar cuenta</span>
          <span className="ayuda">Borra tu progreso, amigos y mensajes para siempre.</span>
        </span>
        {confirmingDelete ? (
          <form onSubmit={deleteAccount} className="flex flex-wrap gap-2">
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Tu contraseña"
              aria-label="Tu contraseña para confirmar"
              className="campo max-w-60 flex-1"
            />
            <button className="btn btn-peligro">Eliminar para siempre</button>
            <button type="button" onClick={() => confirmDelete(false)} className="btn btn-texto">
              Cancelar
            </button>
            {message}
          </form>
        ) : (
          <button onClick={() => confirmDelete(true)} className="btn btn-peligro self-start">
            Eliminar
          </button>
        )}
      </div>
    </>
  );
}
