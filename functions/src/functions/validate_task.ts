import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { createClient } from "@supabase/supabase-js";

interface TaskInput {
  project_id: string;
  title: string;
  due_date?: string;
  assigned_to?: string;
}

export async function validate_task(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return { status: 401, body: "Non authentifié" };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { status: 500, body: "Configuration Supabase manquante" };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  let body: TaskInput;
  try {
    body = (await request.json()) as TaskInput;
  } catch (err) {
    return { status: 400, body: "Requête JSON invalide" };
  }

  const { project_id, title, due_date, assigned_to } = body;
  const errors: string[] = [];

  if (!title || title.trim().length < 3) {
    errors.push("Le titre doit faire au moins 3 caractères");
  }
  if (title?.length > 200) {
    errors.push("Le titre ne peut pas dépasser 200 caractères");
  }
  if (due_date && new Date(due_date) < new Date()) {
    errors.push("La date d'échéance ne peut pas être dans le passé");
  }

  if (assigned_to && project_id) {
    const { data: membership } = await supabase
      .from("project_members")
      .select("user_id")
      .eq("project_id", project_id)
      .eq("user_id", assigned_to)
      .maybeSingle();

    if (!membership) {
      errors.push("L'utilisateur assigné n'est pas membre du projet");
    }
  } else if (assigned_to && !project_id) {
    errors.push("Le project_id est requis pour vérifier l'assignation");
  }

  if (errors.length > 0) {
    return {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valid: false, errors }),
    };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        project_id,
        title: title.trim(),
        due_date,
        assigned_to,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      return { status: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valid: true, task }),
    };
  } catch (err: any) {
    context.log(err.message);
    return { status: 500, body: JSON.stringify({ error: err.message }) };
  }
}

app.http("validate_task", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: validate_task,
});
