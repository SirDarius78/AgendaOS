import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "./AuthShell";

export default function SignupPage({ onGoToLogin }) {
  const { signUp, resendSignupConfirmation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState("");
  const [resending, setResending] = useState(false);

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
        setPendingConfirmationEmail("");
        onGoToLogin();
      } else {
        const safeEmail = email.trim();
        setPendingConfirmationEmail(safeEmail);
        toast.success("Cuenta creada. Revisa tu email para confirmarla.");
      }
    } catch (error) {
      toast.error(error.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!pendingConfirmationEmail) return;

    setResending(true);
    try {
      await resendSignupConfirmation(pendingConfirmationEmail);
      toast.success("Correo de confirmacion reenviado");
    } catch (error) {
      toast.error(error.message || "No se pudo reenviar el correo");
    } finally {
      setResending(false);
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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contrasena"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
            aria-label={
              showConfirmPassword
                ? "Ocultar confirmacion de contrasena"
                : "Mostrar confirmacion de contrasena"
            }
            aria-pressed={showConfirmPassword}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 font-medium transition-colors"
        >
          {loading ? "Procesando..." : "Crear cuenta"}
        </button>
      </form>

      {pendingConfirmationEmail && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            Te enviamos un correo de confirmacion a{" "}
            <strong>{pendingConfirmationEmail}</strong>. Debes confirmar tu
            cuenta para poder iniciar sesion.
          </p>
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resending}
            className="mt-3 w-full rounded-lg border border-amber-300 bg-white py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60"
          >
            {resending ? "Reenviando..." : "Reenviar correo de confirmacion"}
          </button>
        </div>
      )}

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
