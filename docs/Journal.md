# 📘 Journal

---

- [📘 Journal](#-journal)
  - [🧰 Choix techniques](#-choix-techniques)
  - [🗂️ Phases](#️-phases)

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

- [📘 Journal](#-journal)
  - [🧰 Choix techniques](#-choix-techniques)
  - [🗂️ Phases](#️-phases)
    - [🏗️ Setup \& Modélisation de la base de données](#️-setup--modélisation-de-la-base-de-données)
      - [🎯 Cadre de la phase (Setup)](#-cadre-de-la-phase-setup)
      - [🛠️ Mise en oeuvre (Setup)](#️-mise-en-oeuvre-setup)
      - [✅ Validations](#-validations)
    - [🔐 Authentification \& Row Level Security](#-authentification--row-level-security)
      - [🎯 Cadre de la phase (Auth \& RLS)](#-cadre-de-la-phase-auth--rls)
      - [🛠️ Mise en oeuvre (Auth \& RLS)](#️-mise-en-oeuvre-auth--rls)
      - [✅ Validations](#-validations-1)
    - [🛠️ CRUD, uploads de fichiers \& temps réel](#️-crud-uploads-de-fichiers--temps-réel)
      - [🎯 Cadre de la phase](#-cadre-de-la-phase)
      - [🛠️ Mise en oeuvre](#️-mise-en-oeuvre)
      - [✅ Validation](#-validation)
    - [📧 Notifications automatiques par email](#-notifications-automatiques-par-email)
      - [🎯 Cadre de la phase](#-cadre-de-la-phase-1)
      - [🛠️ Mise en oeuvre](#️-mise-en-oeuvre-1)
      - [✅ Validations](#-validations-2)
    - [🌐 Logique métier serverless (3 endpoints)](#-logique-métier-serverless-3-endpoints)
      - [🎯 Cadre de la phase](#-cadre-de-la-phase-2)
      - [🛠️ Mise en oeuvre](#️-mise-en-oeuvre-2)
      - [✅ Validation](#-validation-1)
    - [✅ Intégration finale \& pipeline complet](#-intégration-finale--pipeline-complet)
      - [🎯 Cadre de la phase](#-cadre-de-la-phase-3)
      - [🛠️ Mise en oeuvre](#️-mise-en-oeuvre-3)
      - [✅ Validation](#-validation-2)

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

#### ✅ Validations

- [x] 6 tables sont bien visibles dans le Table Editor.
      <img width="1814" height="1482" alt="image" src="https://github.com/user-attachments/assets/ccfa7b91-28c5-4804-8853-983151008eec" />

- [x] 2 profils et au moins 3 tâches de démonstration sont insérés.
    Profils :
      <img width="2330" height="448" alt="image" src="https://github.com/user-attachments/assets/9cca6f38-af70-45ce-b99a-d5b846693053" />
    Tasks :
      <img width="2840" height="422" alt="image" src="https://github.com/user-attachments/assets/16d366a0-2f1b-43ef-82b1-9f9cce222092" />

---

### 🔐 Authentification & Row Level Security

#### 🎯 Cadre de la phase (Auth & RLS)

Objectif de la phase :

- sécuriser l'accès aux données selon l'identité et le rôle de l'utilisateur

Outil utilisé :

- **Supabase Auth + RLS** pour:
  - gérer l'authentification et appliquer des règles d'accès directement au niveau SQL

#### 🛠️ Mise en oeuvre (Auth & RLS)

- Authentification via Supabase Auth (email/password), avec fonctions dédiées `signUp`, `signIn`, `signOut`.
- Création/mise à jour des profils applicatifs lors de l'inscription.
- Activation de la RLS sur les tables métier, avec politiques pour:
  - lecture limitée aux membres autorisés
  - création de données uniquement pour un utilisateur authentifié
  - modification/suppression uniquement par le propriétaire ou selon le rôle
- Vérification par script de test RLS (`test-rls.ts`) pour valider les refus d'accès non autorisés.

#### ✅ Validations

- [x] Sans authentification: 0 résultat sur les tables protégées.
- [x] Alice voit uniquement ses tâches et aucune tâche d'un autre projet.
- [ ] Toute tentative de modification d'une tâche de Bob est refusée par la RLS.

<img width="1230" height="254" alt="image" src="https://github.com/user-attachments/assets/aaa98786-ed94-43b6-b3d3-3b4c5d530dde" />

---

### 🛠️ CRUD, uploads de fichiers & temps réel

#### 🎯 Cadre de la phase

Objectif de la phase :

- proposer une expérience collaborative fluide avec gestion complète des tâches, pièces jointes et mises à jour en temps réel

Outils utilisés :

- **Supabase SDK** pour:
  - implémenter le CRUD des tâches et commentaires (lecture, création, mise à jour, assignation) avec gestion des permissions applicatives
- **Uploadthing** pour:
  - gérer l'upload sécurisé des pièces jointes (types/tailles autorisés) et récupérer l'URL finale associée à une tâche

#### 🛠️ Mise en oeuvre

- Implémentation des fonctions métier dans `tasks.ts`:
  - récupération des tâches d'un projet avec filtres (`status`, `priority`)
  - création de tâche avec métadonnées (assignation, échéance, fichier joint)
  - mise à jour du statut et assignation d'un utilisateur
  - ajout de commentaires liés aux tâches
- Intégration de l'upload de fichiers avec `upload.ts`:
  - définition des types autorisés (image, pdf) et limites de taille
  - validation côté middleware avant upload
  - association de l'URL du fichier à la tâche
- Mise en place du temps réel dans `realtime.ts`:
  - souscription aux changements PostgreSQL sur `tasks` et `comments`
  - callbacks sur création, mise à jour et suppression
  - suivi de présence des utilisateurs connectés sur un projet

#### ✅ Validation

- [x] `getProjectTasks()` retourne bien les tâches avec profil associé et nombre de commentaires.
- [x] Compte Uploadthing créé et clés configurées dans `.env`.
- [x] Colonne `file_url` présente dans la table `tasks`.
- [x] Alice reçoit en temps réel les créations de Bob (< 500 ms).
- [x] Les changements de statut sont propagés instantanément.
- [x] La présence affiche correctement les deux utilisateurs connectés.

  <img width="2682" height="1348" alt="image" src="https://github.com/user-attachments/assets/1611f480-30ea-42f7-960e-13199ebd8a94" />

  <img width="340" height="626" alt="image" src="https://github.com/user-attachments/assets/2fa4297a-f59c-47ad-811d-bef58bd54c22" />

  <img width="1146" height="422" alt="image" src="https://github.com/user-attachments/assets/33aa830c-a3c1-4478-bf53-d156a8d1c809" />

  <img width="1410" height="752" alt="image" src="https://github.com/user-attachments/assets/7d113d19-3b80-4321-9664-b2eeac8a54f4" />

---

### 📧 Notifications automatiques par email

#### 🎯 Cadre de la phase

Objectif de la phase :

- déclencher et tracer automatiquement les emails transactionnels lors des événements métier clés (assignation, changement de statut, mise à jour de tâche)

Outils utilisés :

- **Azure Functions** pour:
  - exécuter la logique d'envoi d'emails côté serveur après les événements métier (création de tâche, assignation, changement de statut).
- **Resend** pour:
  - envoyer des emails transactionnels fiables (API simple, templates, suivi des envois et gestion des erreurs).

#### 🛠️ Mise en oeuvre

- Création d'un endpoint serverless Azure Functions dédié à l'envoi d'emails.
- Intégration de Resend pour générer et envoyer les notifications transactionnelles.
- Déclenchement de l'envoi depuis les événements métier (webhook Supabase sur `tasks`).
- Ajout de logs applicatifs pour faciliter le suivi des envois et le diagnostic des erreurs.
- Préparation d'une table `notifications` pour tracer l'historique des messages envoyés.

#### ✅ Validations

- [x] Compte Resend créé, clé API dans .env et dans les settings Azure
- [x] Function App fn-taskflow déployé (visible dans le portail Azure)
- [x] Webhook Supabase configuré sur UPDATE de tasks
- [x] Assignation d'une tâche → notification insérée dans la table notifications
- [ ] Logs visibles : az functionapp logs tail --name fn-taskflow --resource-group rg-taskflow

Resend
<img width="2400" height="470" alt="image" src="https://github.com/user-attachments/assets/49ec6c06-6414-4da5-a57c-6539235a0101" />

Supabase
<img width="2326" height="770" alt="image" src="https://github.com/user-attachments/assets/7aff0141-480b-4507-9914-46d6144f2866" />

Portail Azure
<img width="2276" height="996" alt="image" src="https://github.com/user-attachments/assets/1e31653d-16e8-49af-bc8e-704e3fb718fa" />

Logs
(image)

### 🌐 Logique métier serverless (3 endpoints)

#### 🎯 Cadre de la phase

Objectif de la phase :

- centraliser les règles métier côté serveur pour garantir des traitements cohérents, sécurisés et réutilisables depuis le client.

Outil utilisé :

- **Azure Functions** pour:
  - exposer 3 endpoints métier serverless (validation d'accès, orchestration des opérations & réponses API normalisées).

#### 🛠️ Mise en oeuvre

- Définition de 3 endpoints Azure Functions orientés métier (et non CRUD brut).
- Validation des entrées côté serveur (payload, identité utilisateur, droits d'accès).
- Orchestration des opérations entre Supabase (données), notifications et règles de statut.
- Normalisation des réponses API (succès/erreur) pour simplifier la consommation côté client.
- Ajout de logs structurés pour le suivi d'exécution et le débogage en environnement serverless.

#### ✅ Validation

- [x] 4 fonctions déployées (visible dans le portail Azure → fn-taskflow → Functions)
- [x] validate-task : rejette titre court, date passée, non-membre assigné
- [x] project-stats : taux de complétion et tâches en retard corrects
- [x] manage-members : Bob simple membre → 403, owner non retirable

<img width="2384" height="352" alt="image" src="https://github.com/user-attachments/assets/5798aed7-e110-4b2a-9fb7-760f9c273df6" />

<img width="1600" height="562" alt="image" src="https://github.com/user-attachments/assets/7fa33748-8c6d-4edd-9b01-4a150be4e3ac" />

### ✅ Intégration finale & pipeline complet

#### 🎯 Cadre de la phase

Objectif de la phase :

- valider le fonctionnement bout en bout du produit (auth, RLS, CRUD, uploads, realtime, notifications, serverless) et sécuriser la mise en production.

#### 🛠️ Mise en oeuvre

- Exécution d'un scénario d'intégration complet simulant le parcours réel d'un utilisateur.
- Vérification de la cohérence des données entre client, base Supabase et endpoints serverless.
- Contrôle de la chaîne événementielle: changement métier -> webhook -> function -> notification -> realtime.
- Mesure des performances clés (latence API, propagation realtime, temps de traitement serverless).
- Consolidation des preuves de test (captures, logs, résultats checklist) pour valider la phase finale.

#### ✅ Validation

- [x] Le script integration.js tourne sans erreur
- [x] Complétion : 100%
- [x] Alice reçoit exactement 6 événements Realtime (2 × 3 tâches)
- [x] Table notifications contient des entrées pour Bob
- [x] Azure Functions répondent en < 500ms

<img width="836" height="680" alt="image" src="https://github.com/user-attachments/assets/0f16e108-b8d5-4c8a-aacf-364073b53e51" />
