# Journal

## Choix techniques

- **Supabase**: base PostgreSQL managée, Auth intégrée, Row Level Security (RLS), Realtime et stockage de fichiers. Ce choix réduit la maintenance du code backend.
- **Azure Functions**: logique métier serverless pour exposer des endpoints légers, sans gérer d'infrastructure dédiée.
- **TypeScript**: meilleure robustesse du code côté client/backend scripts grâce au typage statique.
- **UploadThing**: gestion simple des uploads (contrôle type/poids, URL finale, intégration rapide côté client).

## Phases

(sommaire)

## Setup & Modélisation de la base de données

- Initialisation du repo Node, installation des dépendances (`@supabase/supabase-js`, `dotenv`, tooling TypeScript).
- Mise en place des variables d'environnement (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`).
- Création d'un client Supabase public et d'un client admin séparés.
- Schéma principal modélisé autour de:
  - `profiles`: profil utilisateur lié à `auth.users`
  - `tasks`: tâches projet (statut, priorité, assignation, échéance, pièce jointe)
  - `comments`: commentaires liés aux tâches
- Ajout des clés étrangères pour sécuriser l'intégrité des relations (créateur, assigné, auteur).

## Authentification & Row Level Security

- Authentification via Supabase Auth (email/password), avec fonctions dédiées `signUp`, `signIn`, `signOut`.
- Création/mise à jour des profils applicatifs lors de l'inscription.
- Activation de la RLS sur les tables métier, avec politiques pour:
  - lecture limitée aux membres autorisés
  - création de données uniquement pour un utilisateur authentifié
  - modification/suppression uniquement par le propriétaire ou selon le rôle

- Vérification par script de test RLS (`test-rls.ts`) pour valider les refus d'accès non autorisés.

## CRUD, uploads de fichiers & temps réel

## Notifications automatiques par email

## Logique métier serverless (3 endpoints)

## Intégration finale & pipeline complet
