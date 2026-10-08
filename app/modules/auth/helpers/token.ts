// ¿Ya caducó el JWT? Lee su campo "exp" (segundos). No verifica la firma: eso lo hacen los servidores.
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return true; // si no se puede leer, no sirve
  }
}
