import { useState } from "react";
import toast from "react-hot-toast";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email y contrasena son obligatorios");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        toast.success("Bienvenida de vuelta");
      } else {
        const data = await signUp(email.trim(), password);
        if (data?.session) {
          toast.success("Cuenta creada");
        } else {
          toast.success("Revisa tu email para confirmar tu cuenta");
        }
      }
    } catch (error) {
      toast.error(error.message || "No se pudo completar la autenticacion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-indigo-100 bg-white/95 shadow-xl p-5 sm:p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              TaskFlow
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Organiza tus tareas por usuario
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-slate-100 p-1 mb-4 w-full">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`w-1/2 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`w-1/2 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 font-medium transition-colors"
          >
            {loading
              ? "Procesando..."
              : mode === "signin"
                ? "Entrar"
                : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
