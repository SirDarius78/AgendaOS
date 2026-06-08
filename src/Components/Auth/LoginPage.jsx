import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "./AuthShell";

export default function LoginPage({ onGoToSignup }) {
  const { signIn } = useAuth();
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
      await signIn(email.trim(), password);
      toast.success("Sesion iniciada");
    } catch (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("email not confirmed")) {
        toast.error(
          "Debes confirmar tu cuenta desde el correo antes de iniciar sesion",
        );
      } else {
        toast.error(error.message || "No se pudo iniciar sesion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Iniciar sesion"
      subtitle="Entra a tu tablero y continua donde lo dejaste."
    >
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
          {loading ? "Procesando..." : "Entrar"}
        </button>
      </form>

      <button
        type="button"
        onClick={onGoToSignup}
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        No tengo cuenta, crear una
      </button>
    </AuthShell>
  );
}
