import { useState } from "react";
import toast from "react-hot-toast";

export default function SharingPanel({
  boards,
  activeBoardId,
  setActiveBoardId,
  isReadOnlyBoard,
  boardMembers,
  myInvitations,
  onInvite,
  onAcceptInvitation,
  onDeclineInvitation,
}) {
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    const nextEmail = email.trim();
    if (!nextEmail) {
      toast.error("Escribe un email para invitar");
      return;
    }

    setInviting(true);
    try {
      await onInvite(nextEmail);
      toast.success("Invitacion enviada");
      setEmail("");
    } catch (error) {
      toast.error(error.message || "No se pudo enviar la invitacion");
    } finally {
      setInviting(false);
    }
  };

  return (
    <section className="mb-4 sm:mb-5 grid gap-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
              Tablero activo
            </p>
            <select
              value={activeBoardId || ""}
              onChange={(e) => setActiveBoardId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:pt-5">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                isReadOnlyBoard
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isReadOnlyBoard ? "Modo lectura" : "Propietario"}
            </span>
          </div>
        </div>

        {!isReadOnlyBoard && (
          <form
            onSubmit={handleInvite}
            className="mt-3 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@empresa.com"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={inviting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2.5 text-sm font-medium"
            >
              {inviting ? "Enviando..." : "Invitar lectura"}
            </button>
          </form>
        )}
      </div>

      {myInvitations.length > 0 && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 sm:p-4">
          <p className="text-sm font-semibold text-indigo-700 mb-2">
            Invitaciones pendientes
          </p>
          <div className="space-y-2">
            {myInvitations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl bg-white border border-indigo-100 px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <p className="text-sm text-gray-700 flex-1">
                  Invitacion para tablero {inv.board_id.slice(0, 8)}...
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAcceptInvitation(inv.id)}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeclineInvitation(inv.id)}
                    className="rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-1.5 text-xs font-medium"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isReadOnlyBoard && boardMembers.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Accesos de lectura
          </p>
          <div className="space-y-1.5">
            {boardMembers.map((member) => (
              <div
                key={member.id}
                className="text-xs sm:text-sm text-gray-600 flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
              >
                <span className="truncate">{member.invited_email}</span>
                <span className="ml-3 shrink-0 capitalize text-gray-400">
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
