// Pantalla de inicio: entrar o crear cuenta.
import { useNavigate } from "react-router";
import { AuthForm } from "../components/AuthForm";
import { useAuthStore } from "../store";

export function AuthScreen() {
  const { mode, toggleMode } = useAuthStore();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-stone-900 p-6">
        <h1 className="text-center text-2xl font-bold text-amber-400">Wild Ones Revival</h1>
        <AuthForm onSuccess={() => navigate("/lobby")} />
        <button onClick={toggleMode} className="w-full text-sm text-stone-400 hover:text-white">
          {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
        </button>
      </div>
    </main>
  );
}
