import { supabase } from "./client.js";

export type Task = {
  id: string;
  title: string;
  status: string;
  project_id: string;
  assigned_to?: string;
};

export type Comment = {
  id: string;
  content: string;
  task_id: string;
  user_id: string;
};

type RealtimeCallbacks = {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (nextTask: Task, prevTask: Task) => void;
  onTaskDeleted?: (task: Task) => void;
  onCommentAdded?: (comment: Comment) => void;
  onPresenceChange?: (users: any[]) => void;
};

export function subscribeToProject(projectId: string, callbacks: RealtimeCallbacks) {
  const channel = supabase.channel(`project:${projectId}`);
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "tasks",
      filter: `project_id=eq.${projectId}`,
    },
    (payload) => {
      if (payload.eventType === "INSERT") callbacks.onTaskCreated?.(payload.new as Task);
      if (payload.eventType === "UPDATE") callbacks.onTaskUpdated?.(payload.new as Task, payload.old as Task);
      if (payload.eventType === "DELETE") callbacks.onTaskDeleted?.(payload.old as Task);
    },
  );
  channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" }, (payload) =>
    callbacks.onCommentAdded?.(payload.new as Comment),
  );
  // Présence : qui est connecté sur ce projet
  channel.on("presence", { event: "sync" }, () => {
    const users = Object.values(channel.presenceState()).flat();
    callbacks.onPresenceChange?.(users);
  });
  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await channel.track({
        username: user?.email,
        online_at: new Date().toISOString(),
      });
    }
  });
  return () => supabase.removeChannel(channel);
}
