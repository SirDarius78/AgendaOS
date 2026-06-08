import { supabase } from "../lib/supabaseClient";

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export async function fetchReadableBoards() {
  const { data, error } = await supabase
    .from("shared_boards")
    .select("id, owner_user_id, title, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function inviteViewerToBoard({ boardId, email }) {
  const invitedEmail = normalizeEmail(email);
  if (!invitedEmail) throw new Error("El email de invitacion es obligatorio");

  const { data, error } = await supabase.functions.invoke("send-board-invite", {
    body: {
      boardId,
      invitedEmail,
    },
  });

  if (error) {
    if (error.message?.includes("Failed to send a request")) {
      throw new Error(
        "No se pudo contactar la funcion de invitaciones. Verifica que este desplegada en Supabase.",
      );
    }
    throw error;
  }

  if (!data) {
    throw new Error("La funcion de invitacion no devolvio datos");
  }

  return data;
}

export async function fetchBoardMembers(boardId) {
  const { data, error } = await supabase
    .from("shared_members")
    .select(
      "id, invited_email, invited_user_id, status, role, created_at, accepted_at",
    )
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchMyPendingInvitations(userId) {
  const { data, error } = await supabase
    .from("shared_members")
    .select("id, board_id, invited_email, status, role, created_at")
    .eq("invited_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function acceptInvitation(memberId, userId) {
  const { data, error } = await supabase
    .from("shared_members")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", memberId)
    .eq("invited_user_id", userId)
    .select("id, board_id, status")
    .single();

  if (error) throw error;
  return data;
}

export async function declineInvitation(memberId, userId) {
  const { data, error } = await supabase
    .from("shared_members")
    .update({ status: "declined" })
    .eq("id", memberId)
    .eq("invited_user_id", userId)
    .select("id, board_id, status")
    .single();

  if (error) throw error;
  return data;
}
