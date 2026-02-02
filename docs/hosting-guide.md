# Guide d’hébergement (simple, gratuit, services séparés)

Ce guide explique comment déployer UniPilot avec **3 services séparés** et gratuits :
- **Frontend** (Next.js) → Vercel
- **Backend** (NestJS) → Render
- **Database** (PostgreSQL + pgvector) → Supabase

> Objectif : un setup **simple**, **gratuit**, et facile à maintenir pour un débutant.

---

## 0) Pré-requis
- Un compte **GitHub** (vous l’avez déjà)
- Un compte **Vercel**
- Un compte **Render**
- Un compte **Supabase**

---

## 1) Base de données (Supabase)

1. Créez un projet Supabase.
2. Dans **Settings → Database**, récupérez la **connection string**.
3. Dans **Extensions**, activez **pgvector** si disponible.
4. Gardez cette URL : elle sera utilisée côté backend.

**Variable à préparer** :
- `DATABASE_URL=postgresql://...`

---

## 2) Backend (Render)

1. Sur Render, créez un **Web Service** depuis votre repo GitHub.
2. Configurez :
   - **Root Directory** : `apps/api`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run start:prod`
3. Ajoutez ces variables d’environnement :
   - `DATABASE_URL` (URL Supabase)
   - `GOOGLE_AI_STUDIO_API_KEY` (votre clé Gemini)
4. Lancez le déploiement.
5. Notez l’URL Render (ex : `https://mon-api.onrender.com`).

---

## 3) Frontend (Vercel)

1. Sur Vercel, importez le même repo GitHub.
2. Configurez :
   - **Root Directory** : `apps/web`
3. Ajoutez la variable d’environnement :
   - `NEXT_PUBLIC_API_URL=https://mon-api.onrender.com`
4. Lancez le déploiement.
5. Notez l’URL Vercel (ex : `https://mon-app.vercel.app`).

---

## 4) Relier correctement les services (IMPORTANT)

### A) Frontend → Backend
- Le frontend utilise `NEXT_PUBLIC_API_URL` pour appeler l’API.
- Vérifiez que la variable Vercel pointe vers l’URL Render.

### B) Backend → Database
- Le backend lit `DATABASE_URL`.
- Vérifiez qu’elle pointe vers Supabase.

### C) CORS (sinon l’API bloque)
Le backend autorise **seulement localhost** pour le moment.
Il faut ajouter l’URL Vercel en production.

**À modifier dans** `apps/api/src/main.ts` :
```ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://mon-app.vercel.app' // ✅ ajoutez votre URL Vercel
  ],
  credentials: true,
});
```

---

## 5) Vérification rapide
- Ouvrez l’URL Vercel
- Testez la création d’un projet
- Envoyez un message dans le chat
- Si vous avez une erreur **CORS**, vérifiez l’URL ajoutée dans le backend.

---

## 6) Checklist finale
- [ ] Vercel : `NEXT_PUBLIC_API_URL` configuré
- [ ] Render : `DATABASE_URL` + clé Gemini configurées
- [ ] Supabase : instance OK + pgvector activé
- [ ] CORS mis à jour avec votre URL Vercel

---

Si vous voulez, je peux aussi :
- Ajouter un **fichier .env.example** complet
- Préparer une **checklist de déploiement** dans le README
- Ajouter un mode **production** pour CORS automatique (basé sur `NODE_ENV`)
