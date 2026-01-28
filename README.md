# UniPilot — LLM Copilot pour Projets Universitaires 🎓🤖
UniPilot est un **Copilot intelligent** qui aide les étudiants à **comprendre, structurer, concevoir et documenter** leurs projets académiques, étape par étape.

> UniPilot n’est pas un “générateur de projet complet”.  
> C’est un **mentor technique & académique** : il explique, guide, vérifie la cohérence, et s’appuie sur tes documents (RAG) pour répondre de façon fiable.

---

## ✨ Fonctionnalités (Roadmap)
### V1 — Base (MVP)
- Compréhension du sujet (reformulation + hypothèses + questions)
- Chat avec historique par projet
- Génération de livrables académiques (Markdown) :
  - Problématique
  - Objectifs
  - Cahier des charges fonctionnel
  - User stories
  - Plan de développement

### V2 — Mémoire + RAG (Différenciation)
- Upload de documents (PDF/DOCX) + extraction texte
- Indexation (embeddings) + recherche sémantique (pgvector)
- Réponses avec **citations** (sources des documents)
- Mémoire de projet (stack, niveau, contraintes prof, décisions)

### V3 — Très poussé
- Module “Vérification” (cohérence objectifs ↔ fonctionnalités ↔ livrables)
- Mode “Plan → Validation → Génération”
- Mode “Soutenance” (questions du jury, défense, risques)
- Exports (Markdown/PDF) d’un dossier complet

---

## 🧱 Architecture (proposée)
- **Frontend** : Next.js (TypeScript)
- **Backend** : NestJS (TypeScript)
- **DB** : PostgreSQL + **pgvector**
- **IA** : Gemini via Google AI Studio (clé API côté backend)
- **Infra** : Docker Compose

---

## 📁 Structure du repo (monorepo)
```
unipilot/
  apps/
    web/          # Next.js (UI)
    api/          # NestJS (API)
  packages/
    shared/       # types/helpers partagés
  infra/
    docker/       # docker-compose + init
  docs/           # décisions, notes, architecture
  .env.example
  README.md
```

---

## ✅ Prérequis
- Node.js LTS (18+ ou 20+)
- Git
- Docker
- VS Code
- Clé API Google AI Studio (Gemini)

---

## 🚀 Démarrage rapide (dev)
> Les commandes exactes dépendront de ton setup final. Ce bloc te donne l’idée générale.

### 1) Infra (DB)
- Lancer Postgres (Docker) :
  - `docker compose up -d` (depuis `infra/docker/` ou la racine selon ton choix)

### 2) Backend (NestJS)
- Installer :
  - `cd apps/api`
  - `npm install`
- Lancer :
  - `npm run start:dev`

### 3) Frontend (Next.js)
- Installer :
  - `cd apps/web`
  - `npm install`
- Lancer :
  - `npm run dev`

---

## 🔐 Variables d’environnement
Crée un fichier `.env` (ou `apps/api/.env`) à partir de `.env.example`.

### Exemple (à adapter)
- `DATABASE_URL=postgresql://...`
- `GOOGLE_AI_STUDIO_API_KEY=...`

⚠️ Ne commit jamais tes secrets :
- `.env` doit rester hors Git (via `.gitignore`)

---

## 🧪 Qualité & conventions
### Convention commits
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`

### Branches (solo)
- `main` : stable
- `dev` : travail courant
- `feature/<nom>` : optionnel

---

## 🗺️ Documentation
- Guide complet (pas à pas) : `docs/unipilot_guide.md`
- Notes d’architecture : `docs/architecture.md`
- Décisions techniques : `docs/adr/` (optionnel)

---

## 🧭 Scope éthique (important)
UniPilot :
- doit **expliquer** avant de générer
- doit poser des questions quand il manque des infos
- ne doit pas encourager la triche (livrables “copiés-collés” sans compréhension)

---

## 📌 Statut
- [ ] V1 en cours
- [ ] V2 planifié
- [ ] V3 planifié

---

## 📄 Licence
À définir (MIT recommandé si open source).
