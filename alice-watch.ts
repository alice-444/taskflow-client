import { signIn } from "./auth.js";
import { subscribeToProject } from "./realtime.js";

// Terminal 1 — alice-watch.js
await signIn("remimoul7@gmail.com", "Modibo93200");
const PROJECT_ID = "5b98bc52-dde5-4497-9422-50d4d9c6519b";
console.log("👀 En attente de modifications sur le projet...");

const unsub = subscribeToProject(PROJECT_ID, {
  onTaskCreated: (t) => {
    console.log("✅ Nouvelle tâche reçue :", t);
  },
  onTaskUpdated: (n, o) => {
    console.log(`🔄 Modification : ${o.title} -> ${n.title} (${n.status})`);
  },
  onCommentAdded: (c) => {
    console.log(`💬 Nouveau commentaire :`, c.content);
  },
  onPresenceChange: (u) => {
    console.log("👥 Utilisateurs en ligne :", u.length);
  },
  onTaskDeleted: (t) => {
    console.log("❌ Tâche supprimée :", t);
  },
});

process.on("SIGINT", async () => {
  console.log("\n👋 Arrêt de l'écoute...");
  await unsub();
  process.exit();
});

// Garder le processus actif
setInterval(() => {}, 1000);
