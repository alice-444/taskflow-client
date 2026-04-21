import { supabase } from "./client.js";
import { signIn, signOut } from "./auth.js";

// Test 1 : sans auth → tout vide
const { data: noAuth, error: noAuthError } = await supabase.from("tasks").select("*");
if (noAuthError) console.error("Erreur Test 1:", noAuthError.message);
console.log("Sans auth:", noAuth?.length, "(attendu: 0)");

// Test 2 : Alice voit ses tâches
const { user } = await signIn("remimoul7@gmail.com", "Modibo93200");
const { data: tasks } = await supabase.from("tasks").select("*").eq("assigned_to", user?.id);
console.log("Tasks:", tasks?.length);

// Test 3 : Alice ne peut pas modifier la tâche de Bob
const { data: bobTask } = await supabase
  .from("tasks")
  .select("id")
  .eq("assigned_to", "43fcf2e3-909d-44e2-89c4-d4bd14eda2ca")
  .single();
const { error } = await supabase.from("tasks").update({ title: "Hacked" }).eq("id", bobTask?.id);
console.log("Modif refusée:", error?.message ?? "⚠ ERREUR : accès accordé !");
await signOut();
