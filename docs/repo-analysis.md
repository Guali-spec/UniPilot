# UniPilot — Analyse du repo

## Vue d'ensemble
- **Monorepo** centré sur deux applications : un **frontend Next.js** (apps/web) et un **backend NestJS** (apps/api), plus l'infra Docker pour PostgreSQL. L'intention et l'architecture cible sont résumées dans le README racine. 【F:README.md†L1-L99】
- La base de données est modélisée via **Prisma** (PostgreSQL + pgvector) avec des entités Project, ChatSession, ChatMessage, Document/DocumentChunk et AntiCheatEvent. 【F:apps/api/prisma/schema.prisma†L1-L74】

## Frontend (apps/web)

### Stack
- **Next.js 16**, React 19, Tailwind, Radix UI, react-hook-form, zod. 【F:apps/web/package.json†L1-L65】
- Scripts : `dev`, `build`, `start`, `lint`. 【F:apps/web/package.json†L5-L10】

### Pages et structure
- **App Router** : page principale `app/page.tsx`, layout global `app/layout.tsx`, styles globaux `app/globals.css`. 【F:apps/web/app/page.tsx†L1-L200】
- Le composant principal orchestre le **dashboard** et le **chat** : gestion de projets, sessions, historique des messages, thème clair/sombre et langue FR/EN. 【F:apps/web/app/page.tsx†L1-L200】

### API client
- Les appels HTTP vers le backend passent par `lib/api.ts` et utilisent `NEXT_PUBLIC_API_URL` (par défaut `http://localhost:3001`). 【F:apps/web/lib/api.ts†L1-L12】
- Endpoints utilisés :
  - `/projects` (GET/POST), `/sessions` (GET/POST), `/chat` (POST), `/chat/history`, `/chat/export`, `/documents` (GET), `/documents/upload` (POST), `/documents/:id` (DELETE), `/sessions/:id/anti-cheat`. 【F:apps/web/lib/api.ts†L33-L104】

## Backend (apps/api)

### Stack
- **NestJS 11** + TypeScript, Prisma, pg (PostgreSQL), pdf-parse, @google/generative-ai. 【F:apps/api/package.json†L15-L38】
- Scripts : `start:dev`, `build`, `prisma:generate`, `prisma:migrate:deploy`, etc. 【F:apps/api/package.json†L8-L20】

### Modules principaux
Le module racine référence les modules suivants :
- Prisma (accès DB)
- Projects, Sessions, Chat, LLM, Documents, Rag
【F:apps/api/src/app.module.ts†L1-L21】

### Endpoints exposés
- **Projects** : création + listing. 【F:apps/api/src/projects/projects.controller.ts†L1-L19】
- **Sessions** : création, listing par projet, anti-cheat events. 【F:apps/api/src/sessions/sessions.controller.ts†L1-L28】
- **Chat** : envoi, historique, export Markdown/JSON. 【F:apps/api/src/chat/chat.controller.ts†L1-L53】
- **Documents** : upload PDF, listing, lecture et suppression. 【F:apps/api/src/documents/documents.controller.ts†L1-L67】

### Modèle de données (Prisma)
- **Project** ↔ **ChatSession** ↔ **ChatMessage**
- **Document** ↔ **DocumentChunk** (avec `embedding` type vector)
- **AntiCheatEvent** lié à une session
【F:apps/api/prisma/schema.prisma†L10-L74】

## Infrastructure
- **docker-compose** pour PostgreSQL (dossier infra). 【F:infra/docker-compose.yml†L1-L18】
- Notes locales de connexion DB sont présentes dans `notes.txt` (host, port, user, password). 【F:notes.txt†L1-L11】

## Flux applicatif (résumé)
1. **Création projet** (frontend) → POST `/projects` → Project en DB.
2. **Création session** → POST `/sessions` → ChatSession en DB.
3. **Chat** → POST `/chat` → messages persistés, exportables via `/chat/export`.
4. **Documents** : upload PDF → extraction + indexation (RAG) prévue via Documents/Rag modules.
【F:apps/web/lib/api.ts†L33-L104】【F:apps/api/src/projects/projects.controller.ts†L1-L19】【F:apps/api/src/sessions/sessions.controller.ts†L1-L28】【F:apps/api/src/chat/chat.controller.ts†L1-L53】【F:apps/api/src/documents/documents.controller.ts†L1-L67】

## Points d'attention
- **Node modules** présents dans le repo (`apps/api/node_modules`, `apps/web/node_modules`) : vérifier le `.gitignore` si vous souhaitez les exclure.
- Le README racine propose une **structure monorepo cible** (packages/, docs/, etc.) qui n'est pas encore intégralement présente. 【F:README.md†L35-L49】
