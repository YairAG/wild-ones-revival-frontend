// Conexión con el lobby del servidor de juego y los datos del jugador que éste devuelve.
import { create } from "zustand";
import type { Player, ServerMessage } from "wildones-protocol";
import { connectGameSocket, type GameSocket } from "@/services/game-socket";
import type { LobbyStatus } from "./types";

// Si el token no sirve, el servidor no responde nada: pasado este tiempo se considera rechazado
const LOGIN_TIMEOUT_MS = 5000;

type LobbyState = {
  status: LobbyStatus;
  player: Player | null;
  error: string | null;
  socket: GameSocket | null;
  connect(token: string): Promise<void>;
  disconnect(): void;
};

export const useLobbyStore = create<LobbyState>((set, get) => ({
  status: "idle",
  player: null,
  error: null,
  socket: null,

  async connect(token) {
    if (get().socket) return; // ya conectado
    set({ status: "connecting", error: null });
    try {
      const socket = await connectGameSocket("/ballistic/lobby?session=x", handleMessage, () =>
        set({ status: "closed", socket: null }),
      );
      set({ socket });
      socket.send({ command: "logIn", token });
      setTimeout(() => {
        if (get().status === "connecting") {
          set({ status: "error", error: "El servidor no aceptó la sesión. Vuelve a entrar." });
        }
      }, LOGIN_TIMEOUT_MS);
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  disconnect() {
    get().socket?.close();
    set({ socket: null, player: null, status: "idle" });
  },
}));

// Mensajes del servidor en el lobby
function handleMessage(message: ServerMessage): void {
  if (message.command === "setPlayer" || message.command === "player") {
    useLobbyStore.setState({ player: message as Player, status: "connected" });
  }
}
