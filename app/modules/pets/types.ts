/** Lo necesario para dibujar una mascota tal como se ve en el juego (viene del perfil del backend) */
export type PetLook = {
  name: string;
  type: string; // especie: dog, monkey...
  gender: string;
  color1: string | number; // "0x6C6C6C" o 7105644: el juego entiende los dos
  color2: string | number;
  accessories: string[]; // la ropa que lleva puesta
  current?: boolean; // si es la que usa ahora
};
