import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { createClient } from "@supabase/supabase-js";

interface ManageMembersInput {
  action: "add" | "remove";
  project_id: string;
  target_user_id: string;
  role?: "member" | "admin" | "owner";
}

export async function manage_members(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return { status: 401, body: "Unauthorized" };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return { status: 500, body: "Configuration Supabase manquante" };
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user) {
    return { status: 401, body: "Invalid token" };
  }

  let body: ManageMembersInput;
  try {
    body = (await request.json()) as ManageMembersInput;
  } catch (err) {
    return { status: 400, body: "Requête JSON invalide" };
  }

  const { action, project_id, target_user_id, role } = body;

  // Vérifier que l'appelant est admin ou owner
  const { data: callerMembership } = await adminClient
    .from("project_members")
    .select("role")
    .eq("project_id", project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!callerMembership || !["admin", "owner"].includes(callerMembership.role)) {
    return { status: 403, body: JSON.stringify({ error: "Admin requis" }) };
  }

  if (action === "add") {
    const { error } = await adminClient.from("project_members").insert({
      project_id,
      user_id: target_user_id,
      role: role ?? "member",
    });

    if (error) {
      return { status: 400, body: JSON.stringify({ error: error.message }) };
    }
    return { status: 200, body: JSON.stringify({ success: true }) };
  }

  if (action === "remove") {
    const { data: target } = await adminClient
      .from("project_members")
      .select("role")
      .eq("project_id", project_id)
      .eq("user_id", target_user_id)
      .maybeSingle();

    if (target?.role === "owner") {
      return {
        status: 403,
        body: JSON.stringify({ error: "Impossible de retirer le owner" }),
      };
    }

    const { error } = await adminClient
      .from("project_members")
      .delete()
      .eq("project_id", project_id)
      .eq("user_id", target_user_id);

    if (error) {
      return { status: 400, body: JSON.stringify({ error: error.message }) };
    }
    return { status: 200, body: JSON.stringify({ success: true }) };
  }

  return { status: 400, body: JSON.stringify({ error: "action invalide" }) };
}

app.http("manage_members", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: manage_members,
});
