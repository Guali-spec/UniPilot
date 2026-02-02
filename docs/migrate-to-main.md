# Migration vers la branche `main`

Ce guide propose une migration propre de la branche locale actuelle vers `main`, avec ou sans remote.

## Pré-requis
- Une copie de sauvegarde ou un commit propre avant renaming.
- Un arbre de travail propre (`git status`).

## Cas 1 — Repo local uniquement (sans remote)
1. **Renommer la branche courante** en `main` :
   ```bash
   git branch -m main
   ```
2. Vérifier :
   ```bash
   git status -sb
   git branch -vv
   ```

## Cas 2 — Repo avec remote (GitHub/GitLab)
1. **Renommer localement** :
   ```bash
   git branch -m main
   ```
2. **Pousser `main`** et définir le suivi :
   ```bash
   git push -u origin main
   ```
3. **Changer la branche par défaut** dans l'UI du provider (GitHub/GitLab).
4. **Supprimer l'ancienne branche** distante (si nécessaire) :
   ```bash
   git push origin --delete work
   ```

## Synchronisation d'équipe
- Mettre à jour les instructions internes (README/CONTRIBUTING).
- Informer l'équipe de la nouvelle branche par défaut.

## Vérification finale
- Cloner le repo frais → vérifier que `main` est bien la branche par défaut.
- Lancer `npm install` et `npm run dev` côté web, `npm run start:dev` côté API, si besoin.
