import { createUploadthing, type FileRouter } from "uploadthing/server";
import { generateUploadButton } from "@uploadthing/react";

const f = createUploadthing();

// Définir les types de fichiers acceptés
export const uploadRouter = {
  taskAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // Vérifier que l'user est connecté
      const token = req.headers.get("authorization")?.replace("Bearer ", "");
      if (!token) throw new Error("Non authentifié");
      return { token };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Fichier uploadé:", file.ufsUrl);
      return { url: file.ufsUrl, name: file.name };
    }),
} satisfies FileRouter;

// Upload direct depuis le client (sans passer par un serveur)
export const UploadButton = generateUploadButton({ url: "/api/uploadthing" });
