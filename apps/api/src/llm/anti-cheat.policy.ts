import { CheatDetection } from './cheat.detector';

export function buildAntiCheatInstruction(d: CheatDetection): string {
  if (d.label === 'cheating') {
    return `
ANTI-TRICHE:
- L'étudiant demande une solution complète. Tu dois refuser poliment.
- Tu NE fournis PAS: solution finale, code complet, corrigé complet, rédaction intégrale.
- Tu fournis à la place:
  1) une explication pédagogique du raisonnement,
  2) un plan d'étapes,
  3) 3 à 6 questions pour guider,
  4) un mini-exemple partiel (optionnel) non directement copiable.
- Encourage l'étudiant à proposer une tentative avant.
`;
  }

  if (d.label === 'borderline') {
    return `
ANTI-TRICHE:
- La demande peut mener à une solution clé-en-main. Tu évites les réponses copiables.
- Tu guides: démarche, structure, pseudo-code, checklist, erreurs fréquentes.
- Tu poses 3 à 6 questions pour cadrer.
- Tu proposes un exemple PARTIEL (petit) seulement si nécessaire.
`;
  }

  return `
ANTI-TRICHE:
- Demande autorisée. Aide pédagogique normale, mais reste structuré et pragmatique.
`;
}
