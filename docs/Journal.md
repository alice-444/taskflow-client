# 📘 Journal

---

- 📘 Journal
  - 🧰 Choix techniques
  - 🗂️ Phases
    - 🏗️ Setup & Modélisation de la base de données
    - 🔐 Authentification & Row Level Security
    - 🛠️ CRUD, uploads de fichiers & temps réel
    - 📧 Notifications automatiques par email
    - 🌐 Logique métier serverless (3 endpoints)
    - ✅ Intégration finale & pipeline complet
    - 📊 Monitoring & tests de charge

---

## 🧰 Choix techniques

- **🟦 TypeScript**: meilleure robustesse du code côté client/backend scripts grâce au typage statique.
- **🗄️ Supabase**: base PostgreSQL managée, Auth intégrée, Row Level Security (RLS), Realtime et stockage de fichiers. Ce choix réduit la maintenance du code backend.
- **⚡ Azure Functions**: logique métier serverless pour exposer des endpoints légers, sans gérer d'infrastructure dédiée.
- **📬 Resend**: envoi d'emails transactionnels (notifications automatiques) via API simple, fiable en serverless et facile à intégrer dans les endpoints Azure Functions.
- **📎 Uploadthing**: gestion simple des uploads (contrôle type/poids, URL finale, intégration rapide côté client).
- **🧪 K6**: tests de charge et de performance pour simuler des utilisateurs concurrents, mesurer les temps de réponse des endpoints et valider la tenue en charge.
- **📊 Azure Monitor / App Insights**: observabilité en production (logs, métriques, traces, erreurs) pour diagnostiquer rapidement les incidents et suivre la santé des fonctions serverless.

---

## 🗂️ Phases

- 🏗️ Setup & Modélisation de la base de données
- 🔐 Authentification & Row Level Security
- 🛠️ CRUD, uploads de fichiers & temps réel
- 📧 Notifications automatiques par email
- 🌐 Logique métier serverless (3 endpoints)
- ✅ Intégration finale & pipeline complet
- 📊 Monitoring & tests de charge

---

### 🏗️ Setup & Modélisation de la base de données

#### 🎯 Cadre de la phase (Setup)

Objectif de la phase :

- mettre en place une base solide (projet, environnement, schéma relationnel) avant les fonctionnalités métier

Outil utilisé :

- **Supabase DB + SQL** pour:
  - définir le schéma relationnel (`profiles`, `tasks`, `comments`) et les contraintes d'intégrité
  - écrire les migrations/requêtes SQL nécessaires aux relations et index
  - centraliser la logique de sécurité au plus près des données (RLS et politiques SQL)

#### 🛠️ Mise en oeuvre (Setup)

- Initialisation du repo Node, installation des dépendances (`@supabase/supabase-js`, `dotenv`, tooling TypeScript).
- Mise en place des variables d'environnement (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`).
- Création d'un client Supabase public et d'un client admin séparés.
- Schéma principal modélisé autour de:
  - `profiles`: profil utilisateur lié à `auth.users`
  - `tasks`: tâches projet (statut, priorité, assignation, échéance, pièce jointe)
  - `comments`: commentaires liés aux tâches
- Ajout des clés étrangères pour sécuriser l'intégrité des relations (créateur, assigné, auteur).

---

### 🔐 Authentification & Row Level Security

#### 🎯 Cadre de la phase (Auth & RLS)

Objectif de la phase :

- sécuriser l'accès aux données selon l'identité et le rôle de l'utilisateur

Outil utilisé :

- **Supabase Auth + RLS** pour gérer l'authentification et appliquer des règles d'accès directement au niveau SQL

#### 🛠️ Mise en oeuvre (Auth & RLS)

- Authentification via Supabase Auth (email/password), avec fonctions dédiées `signUp`, `signIn`, `signOut`.
- Création/mise à jour des profils applicatifs lors de l'inscription.
- Activation de la RLS sur les tables métier, avec politiques pour:
  - lecture limitée aux membres autorisés
  - création de données uniquement pour un utilisateur authentifié
  - modification/suppression uniquement par le propriétaire ou selon le rôle

- Vérification par script de test RLS (`test-rls.ts`) pour valider les refus d'accès non autorisés.

---

### 🛠️ CRUD, uploads de fichiers & temps réel

#### 🎯 Cadre de la phase

Objectif de la phase :

- ??

Outil utilisé :

- **??** pour:

#### 🛠️ Mise en oeuvre

??

---

### 📧 Notifications automatiques par email

#### 🎯 Cadre de la phase

Objectif de la phase :

- ??

Outil utilisé :

- **??** pour:

#### 🛠️ Mise en oeuvre

??

---

### 🌐 Logique métier serverless (3 endpoints)

#### 🎯 Cadre de la phase

Objectif de la phase :

- ??

Outil utilisé :

- **??** pour:

#### 🛠️ Mise en oeuvre

??

---

### ✅ Intégration finale & pipeline complet

#### 🎯 Cadre de la phase

Objectif de la phase :

- ??

Outil utilisé :

- **??** pour:

#### 🛠️ Mise en oeuvre

??

---

### Monitoring & tests de charge

#### 🎯 Cadre de la phase

Objectif de la phase :

- ??

Outil utilisé :

- **??** pour:

#### 🛠️ Mise en oeuvre

??