/** Lo que devuelve el backend de cuentas al registrarse o entrar */
export type Session = {
  id: number;
  dname: string;
  token: string; // JWT para entrar al servidor de juego
};

export type AuthMode = "login" | "register";

/** Aviso del nombre en el registro, mientras escribes. idle: todavía no hay nada que decir */
export type NameCheck = {
  status: "idle" | "checking" | "available" | "taken" | "invalid";
  message: string;
};
