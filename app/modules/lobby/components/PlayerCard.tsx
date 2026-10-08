import type { Player } from "wildones-protocol";

export function PlayerCard({ player }: { player: Player }) {
  const pet = player.ownedPets[player.currentPet];
  return (
    <div className="space-y-2 rounded-lg bg-stone-900 p-6">
      <h2 className="text-xl font-bold text-amber-400">{player.dname}</h2>
      <p className="text-stone-300">
        Nivel {player.level} · {player.xp} XP
      </p>
      <p className="text-stone-300">
        🪙 {player.gold} oro · 🍖 {player.treats} treats
      </p>
      {pet && (
        <p className="text-stone-300">
          Mascota: {pet.name} ({pet.type})
        </p>
      )}
    </div>
  );
}
