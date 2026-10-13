// Perfil de jugador (modal): se abre al tocar un nombre en el chat o en amigos. Desde ahí se agrega, invita,
// bloquea o reporta. Si se abrió desde un mensaje del chat, ese mensaje se adjunta al reporte.
import { create } from "zustand";
import { friendsApi } from "@/modules/friends/services/friends-api";
import { useFriendsStore } from "@/modules/friends/store";
import { useInvitesStore } from "@/modules/invites/store";
import { profileApi } from "./services/profile-api";
import type { PlayerProfile, ProfileStep, ReportedMessage, ReportReason } from "./types";

type ProfileState = {
  playerId: number | null; // null: cerrado
  message: ReportedMessage | null;
  profile: PlayerProfile | null; // null: cargando
  step: ProfileStep;
  notice: string | null; // lo que respondió el backend ("Bloqueaste a Beto", errores...)
  show(playerId: number, message?: ReportedMessage): void;
  hide(): void;
  setStep(step: ProfileStep): void;
  addFriend(): Promise<void>;
  invite(): void;
  toggleBlock(): Promise<void>;
  report(reason: ReportReason, details: string, alsoBlock: boolean): Promise<void>;
};

export const useProfileStore = create<ProfileState>((set, get) => {
  async function load() {
    const id = get().playerId;
    if (id === null) return;
    try {
      set({ profile: await profileApi.get(id) });
    } catch (e) {
      set({ notice: (e as Error).message });
    }
  }

  // Hace la acción, muestra lo que respondió el backend y recarga el perfil y la lista de amigos
  async function run(action: () => Promise<{ message: string }>) {
    try {
      set({ notice: (await action()).message });
    } catch (e) {
      set({ notice: (e as Error).message });
    }
    await Promise.all([load(), useFriendsStore.getState().load()]);
  }

  return {
    playerId: null,
    message: null,
    profile: null,
    step: "profile",
    notice: null,

    show(playerId, message) {
      set({ playerId, message: message ?? null, profile: null, step: "profile", notice: null });
      void load();
    },
    hide: () => set({ playerId: null }),
    setStep: (step) => set({ step, notice: null }),

    addFriend: () => run(() => friendsApi.send(get().profile!.dname)),
    invite() {
      useInvitesStore.getState().invite(get().profile!.id);
      set({ playerId: null }); // el aviso de la invitación sale en la esquina
    },
    toggleBlock() {
      const { id, blocked } = get().profile!;
      return run(() => (blocked ? profileApi.unblock(id) : profileApi.block(id)));
    },

    async report(reason, details, alsoBlock) {
      const { profile, message } = get();
      if (!profile) return;
      try {
        await profileApi.report({
          targetId: profile.id,
          reason,
          ...(details && { details }),
          ...(message && { messageId: message.id }),
        });
        if (alsoBlock && !profile.blocked) await profileApi.block(profile.id);
        set({ step: "sent", notice: null });
        if (alsoBlock) void useFriendsStore.getState().load();
      } catch (e) {
        set({ notice: (e as Error).message });
      }
    },
  };
});
