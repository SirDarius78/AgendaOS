import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "./AuthShell";

export default function SignupPage({ onGoToLogin }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("Completa todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contrasena debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const data = await signUp(email.trim(), password);
      if (data?.session) {
        toast.success("Cuenta creada");
      } else {
        toast.success("Revisa tu email para confirmar tu cuenta");
      }
    } catch (error) {
      toast.error(error.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Cada usuario tendra sus propias tareas aisladas por Supabase Auth y RLS."
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
        <input
          type="password"
          placeholder="Confirmar contrasena"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 font-medium transition-colors"
        >
          {loading ? "Procesando..." : "Crear cuenta"}
        </button>
      </form>

      <button
        type="button"
        onClick={onGoToLogin}
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        Ya tengo cuenta, iniciar sesion
      </button>
    </AuthShell>
  );
}
