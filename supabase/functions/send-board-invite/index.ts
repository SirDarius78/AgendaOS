import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeEmail(email: string) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const appBaseUrl =
      Deno.env.get("APP_BASE_URL") ||
      Deno.env.get("SITE_URL") ||
      "http://localhost:5173";

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse(500, {
        error:
          "Faltan secrets de Supabase (SUPABASE_URL, SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY)",
      });
    }

    if (!resendApiKey || !resendFromEmail) {
      return jsonResponse(500, {
        error: "Faltan secrets de Resend (RESEND_API_KEY o RESEND_FROM_EMAIL)",
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse(401, { error: "No autorizado" });
    }

    const body = await req.json();
    const boardId = String(body?.boardId || "").trim();
    const invitedEmail = normalizeEmail(String(body?.invitedEmail || ""));

    if (!boardId) {
      return jsonResponse(400, { error: "boardId es obligatorio" });
    }

    if (!invitedEmail) {
      return jsonResponse(400, { error: "invitedEmail es obligatorio" });
    }

    if (invitedEmail === normalizeEmail(user.email || "")) {
      return jsonResponse(400, { error: "No puedes invitarte a ti misma" });
    }

    const { data: board, error: boardError } = await adminClient
      .from("shared_boards")
      .select("id, title, owner_user_id")
      .eq("id", boardId)
      .single();

    if (boardError || !board) {
      return jsonResponse(404, { error: "Tablero no encontrado" });
    }

    if (board.owner_user_id !== user.id) {
      return jsonResponse(403, {
        error: "Solo la persona propietaria puede invitar",
      });
    }

    const { data: invitedProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", invitedEmail)
      .maybeSingle();

    const invitedUserId = invitedProfile?.id || null;

    const { data: existingInvite } = await adminClient
      .from("shared_members")
      .select("id, status, invited_user_id")
      .eq("board_id", boardId)
      .eq("invited_email", invitedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingInvite?.status === "accepted") {
      return jsonResponse(409, {
        error: "Ese email ya tiene acceso al tablero",
      });
    }

    let member;

    if (existingInvite?.id) {
      const { data: updatedInvite, error: updateError } = await adminClient
        .from("shared_members")
        .update({
          status: "pending",
          invited_user_id: invitedUserId,
          invited_by_user_id: user.id,
        })
        .eq("id", existingInvite.id)
        .select("id, invited_email, status, role, created_at")
        .single();

      if (updateError || !updatedInvite) {
        return jsonResponse(500, {
          error: "No se pudo actualizar la invitacion",
        });
      }

      member = updatedInvite;
    } else {
      const { data: createdInvite, error: createError } = await adminClient
        .from("shared_members")
        .insert({
          board_id: boardId,
          invited_by_user_id: user.id,
          invited_email: invitedEmail,
          invited_user_id: invitedUserId,
          role: "viewer",
          status: "pending",
        })
        .select("id, invited_email, status, role, created_at")
        .single();

      if (createError || !createdInvite) {
        return jsonResponse(500, { error: "No se pudo crear la invitacion" });
      }

      member = createdInvite;
    }

    const baseUrl = appBaseUrl.replace(/\/$/, "");
    const inviteUrl = `${baseUrl}/`;

    const emailResult = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [invitedEmail],
        subject: `Invitacion al tablero \"${board.title}\"`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
            <h2 style="margin-bottom: 10px;">Tienes una invitacion</h2>
            <p>Te invitaron al tablero <strong>${board.title}</strong> en modo lectura.</p>
            <p>Para aceptarla, inicia sesion con este mismo email en la app.</p>
            <p>
              <a href="${inviteUrl}" style="display:inline-block;padding:10px 14px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;">Abrir app</a>
            </p>
          </div>
        `,
      }),
    });

    if (!emailResult.ok) {
      const resendErrorText = await emailResult.text();
      return jsonResponse(502, {
        error: `Resend fallo al enviar el email: ${resendErrorText}`,
      });
    }

    return jsonResponse(200, { ...member, emailSent: true });
  } catch (error) {
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});
