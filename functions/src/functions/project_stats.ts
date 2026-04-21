import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { createClient } from "@supabase/supabase-js";

interface TaskRow {
  status: string;
  due_date: string | null;
  assigned_to: string | null;
}

interface ProjectStats {
  total_tasks: number;
  completion_rate: number;
  by_status: Record<string, number>;
  overdue_count: number;
  active_members: number;
}

export async function project_stats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const projectId = request.query.get("project_id");

  if (!projectId) {
    return { status: 400, body: "project_id requis" };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { status: 500, body: "Configuration Supabase manquante" };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: allTasks, error } = await supabase
    .from("tasks")
    .select("status, due_date, assigned_to")
    .eq("project_id", projectId);

  if (error) {
    context.error(`Erreur Supabase: ${error.message}`);
    return { status: 500, body: JSON.stringify({ error: error.message }) };
  }

  const tasks = (allTasks as TaskRow[]) ?? [];

  const statusCount = tasks.reduce((acc: Record<string, number>, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const today = new Date().toISOString().split("T")[0];

  const overdueCount = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== "done").length;

  const uniqueMembers = new Set(tasks.map((t) => t.assigned_to).filter((id): id is string => !!id)).size;

  const total = tasks.length;
  const done = statusCount["done"] ?? 0;

  const stats: ProjectStats = {
    total_tasks: total,
    completion_rate: total > 0 ? Math.round((done / total) * 100) : 0,
    by_status: statusCount,
    overdue_count: overdueCount,
    active_members: uniqueMembers,
  };

  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stats),
  };
}

app.http("project_stats", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: project_stats,
});
