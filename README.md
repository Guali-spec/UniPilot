# UniPilot — LLM Copilot pour projets universitaires
UniPilot est un **copilote intelligent** qui aide les étudiants à **comprendre, structurer, concevoir et documenter** leurs projets académiques, étape par étape.

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
- Node.js LTS (20+ recommandé)
- npm (ou pnpm)
- Git
- Docker + Docker Compose
- Clé API Google AI Studio (Gemini)
- PostgreSQL (si tu ne passes pas par Docker)

---

## 🚀 Installation locale (dev)

### 1) Cloner le repo
```
git clone https://github.com/Guali-spec/UniPilot.git
cd UniPilot
```

### 2) Base de données (Postgres)
Option Docker (recommandé) :
```
cd infra/docker
docker compose up -d
```

Option local :
- Démarre PostgreSQL en local
- Crée une base (ex: `unipilot_db`)

### 3) Backend (NestJS)
```
cd apps/api
npm install
```

Configurer l’environnement :
- Crée `apps/api/.env` à partir de `.env.example`
- Renseigne `DATABASE_URL` et `GOOGLE_AI_STUDIO_API_KEY`

Générer Prisma + appliquer les migrations :
```
npm run prisma:generate
npx prisma migrate dev
```

Lancer l’API :
```
npm run start:dev
```

### 4) Frontend (Next.js)
```
cd apps/web
npm install
```

Configurer l’environnement :
- Crée `apps/web/.env.local`
- Ajoute `NEXT_PUBLIC_API_URL=http://localhost:3001`

Lancer le frontend :
```
npm run dev
```

---

## 🔐 Variables d’environnement
Backend (`apps/api/.env`) :
- `DATABASE_URL=postgresql://...`
- `GOOGLE_AI_STUDIO_API_KEY=...`

Frontend (`apps/web/.env.local`) :
- `NEXT_PUBLIC_API_URL=http://localhost:3001`

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
- Analyse du repo : `docs/repo-analysis.md`
- Migration vers `main` : `docs/migrate-to-main.md`
- Guide d’hébergement (gratuit) : `docs/hosting-guide.md`

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
