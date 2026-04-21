// Terminal 2 — bob-actions.js
import { signIn } from "./auth.js";
import { createTask, updateTaskStatus, addComment } from "./tasks.js";
console.log("🚀 Bob se connecte...");
await signIn("test123@gmail.fr", "Modibo1234");
console.log("✅ Bob connecté.");
const PROJECT_ID = "5b98bc52-dde5-4497-9422-50d4d9c6519b";
console.log("📝 Création d'une tâche...");
const task = await createTask(PROJECT_ID, {
  title: "Implémenter le système de notifications en temps réel",
  priority: "high",
  assignedTo: "c23f6989-c8c3-413c-99b5-cb23e9d3dd1f", // ID de Bob
});
console.log("✅ Tâche créée:", task.id);
await new Promise((r) => setTimeout(r, 1000));
console.log("🔄 Mise à jour du statut...");
await updateTaskStatus(task.id, "in_progress");
console.log("✅ Statut mis à jour.");
await new Promise((r) => setTimeout(r, 1000));
console.log("💬 Ajout d'un commentaire...");
await addComment(task.id, "Je commence maintenant !");
console.log("✅ Commentaire ajouté.");
