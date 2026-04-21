import { supabase } from "./client.js";

type TaskFilters = {
  status?: string;
  priority?: string;
};

type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: string;
  assignedTo?: string | null;
  dueDate?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
};

export async function getProjectTasks(
  projectId: string,
  filters: TaskFilters = {},
) {
  let query = supabase
    .from("tasks")
    .select(
      `
*,
assigned_profile:profiles!tasks_assigned_to_fkey(username, full_name),
creator:profiles!tasks_created_by_fkey(username),
comments(count)
`,
    )
    .eq("project_id", projectId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTask(projectId: string, taskData: CreateTaskInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority ?? "medium",
      assigned_to: taskData.assignedTo ?? null,
      due_date: taskData.dueDate ?? null,
      file_url: taskData.fileUrl ?? null, // URL Uploadthing
      file_name: taskData.fileName ?? null,
      created_by: user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const valid = ["todo", "in_progress", "review", "done"];
  if (!valid.includes(status)) throw new Error("Statut invalide");
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function assignTask(taskId: string, userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ assigned_to: userId })
    .eq("id", taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addComment(taskId: string, content: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be authenticated");

  const { data, error } = await supabase
    .from("comments")
    .insert({ task_id: taskId, author_id: user.id, content })
    .select("*, author:profiles(username)")
    .single();
  if (error) throw error;
  return data;
}
