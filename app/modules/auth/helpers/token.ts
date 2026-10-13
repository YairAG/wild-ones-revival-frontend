// ¿Ya caducó el JWT (o caduca en menos de `marginMs`)? Lee su campo "exp" (segundos). No verifica la firma: eso
// lo hacen los servidores.
export function isTokenExpired(token: string, marginMs = 0): boolean {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" && exp * 1000 <= Date.now() + marginMs;
  } catch {
    return true; // si no se puede leer, no sirve
  }
}
