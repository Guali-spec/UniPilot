export function ensureUniPilotFormat(text: string): string {
  const requiredHeadings = [
    '## 1) Résumé',
    "## 2) Ce que j'ai compris",
    '## 3) Questions pour avancer',
    "## 4) Plan d’action",
    '## 5) Livrables attendus',
    '## 6) Risques et erreurs fréquentes',
    '## 7) Prochaine action',
  ];

  const hasAll = requiredHeadings.every((h) => text.includes(h));
  if (hasAll) return text;

  // Fallback simple: on met la réponse brute dans une structure standard
  return `## 1) Résumé
${text.trim().slice(0, 400)}${text.trim().length > 400 ? '…' : ''}

## 2) Ce que j'ai compris
- À préciser (réponse non structurée détectée)

## 3) Questions pour avancer (si nécessaire)
- Aucune

## 4) Plan d’action
1. Reformuler le besoin en 3 phrases
2. Lister les fonctionnalités essentielles
3. Définir les entités (base de données)
4. Définir les endpoints API
5. Construire l’UI (écrans)
6. Tester et itérer

## 5) Livrables attendus
- [ ] Résumé du projet
- [ ] Liste des modules
- [ ] Modèle de données
- [ ] Endpoints API
- [ ] Maquettes UI

## 6) Risques et erreurs fréquentes
- Réponse hors format
- Besoin pas assez précis
- Trop de fonctionnalités d’un coup
- Pas de priorisation

## 7) Prochaine action (tout de suite)
Réponds avec ton objectif principal + 3 fonctionnalités prioritaires.
`;
}
