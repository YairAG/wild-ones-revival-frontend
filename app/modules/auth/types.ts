/** Lo que devuelve el backend de cuentas al registrarse o entrar */
export type Session = {
  id: number;
  dname: string;
  token: string; // JWT para entrar al servidor de juego
};

export type AuthMode = "login" | "register";
