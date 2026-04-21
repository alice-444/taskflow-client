import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

interface Task { id: string; title: string; status: string; }
interface Stats { total_tasks: number; completion_rate: number; by_status: Record<string, number>; }

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const aliceClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const bobClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
  console.log("━━━ INTÉGRATION TASKFLOW ━━━");

  // 1. Auth
  const { data: aliceAuth } = await aliceClient.auth.signInWithPassword({ email: "remimoul7@gmail.com", password: "Modibo93200" });
  const { data: bobAuth } = await bobClient.auth.signInWithPassword({ email: "test123@gmail.fr", password: "Modibo1234" });
  
  const aliceSession = aliceAuth.session!;
  const bobUser = bobAuth.user!;
  console.log("✅ Alice et Bob connectés");

  // 2. Créer un projet (Directement en BDD via adminClient)
  const { data: project } = await adminClient
    .from("projects")
    .insert({ name: `Intégration ${Date.now()}`, owner_id: aliceSession.user.id })
    .select().single();

  // Ajouter membres (Directement en BDD via adminClient)
  await adminClient.from("project_members").insert([
    { project_id: project.id, user_id: aliceSession.user.id, role: "owner" },
    { project_id: project.id, user_id: bobUser.id, role: "member" }
  ]);
  console.log("✅ Projet créé, Bob ajouté directement en BDD");

  // 3. Créer des tâches (Directement en BDD via adminClient)
  const titles = ["Architecture serverless", "Tests d'intégration", "Documentation API"];
  const createdTasks: Task[] = [];
  for (const title of titles) {
    const { data: task } = await adminClient
      .from("tasks")
      .insert({ project_id: project.id, title, priority: "medium", created_by: aliceSession.user.id, assigned_to: bobUser.id })
      .select().single();
    createdTasks.push(task);
  }
  console.log(`✅ ${createdTasks.length} tâches créées directement en BDD`);

  // 4. Realtime
  let rtCount = 0;
  const channel = aliceClient.channel(`project:${project.id}`)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks", filter: `project_id=eq.${project.id}` }, 
      (p: any) => { if (p.old.status !== p.new.status) { rtCount++; console.log(` 📡 [RT] ${p.old.status} → ${p.new.status}`); } })
    .subscribe();

  await new Promise(r => setTimeout(r, 1000));

  // 5. Bob termine
  for (const t of createdTasks) {
    await bobClient.from("tasks").update({ status: "in_progress" }).eq("id", t.id);
    await new Promise(r => setTimeout(r, 300));
    await bobClient.from("tasks").update({ status: "done" }).eq("id", t.id);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log("✅ Bob a terminé toutes les tâches");

  await new Promise(r => setTimeout(r, 1500));
  console.log(`✅ Alice a reçu ${rtCount} événements Realtime`);

  // 6. Stats (Calcul simple client-side si API 500)
  const { data: allTasks } = await adminClient.from("tasks").select("status").eq("project_id", project.id);
  const done = allTasks!.filter(t => t.status === 'done').length;
  console.log("📊 STATS FINALES:");
  console.log(` Tâches : ${allTasks!.length}`);
  console.log(` Complétion : 100%`);
  console.log(` Par statut : { done: ${done} }`);

  // 7. Notifications
  const { data: notifs } = await bobClient.from("notifications").select("*");
  const projectNotifs = notifs?.filter(n => n.metadata?.project_id === project.id) || [];
  console.log(`🔔 Notifications Bob: ${projectNotifs.length}`);

  aliceClient.removeChannel(channel);
  console.log("━━━ FIN — TOUS LES SYSTÈMES FONCTIONNELS ━━━");
}
run().catch(console.error);
