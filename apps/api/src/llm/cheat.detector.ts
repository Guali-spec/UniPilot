export type CheatLabel = 'allowed' | 'borderline' | 'cheating';

export interface CheatDetection {
  label: CheatLabel;
  reason: string;
}

const CHEATING_PATTERNS = [
  /fais(-| )?le devoir/i,
  /donne(-| )?la solution/i,
  /corrig(e|é) (compl[eè]t|total)/i,
  /code complet/i,
  /r[eé]dige (tout|entièrement)/i,
  /réponse finale/i,
  /sans explication/i,
];

const BORDERLINE_PATTERNS = [
  /exemple (complet|entier)/i,
  /mod[eè]le de r[eé]ponse/i,
  /corrig[eé]/i,
  /solution/i,
];

export function detectCheating(message: string): CheatDetection {
  const text = message.toLowerCase();

  if (CHEATING_PATTERNS.some((p) => p.test(text))) {
    return {
      label: 'cheating',
      reason: 'Demande explicite de solution complète',
    };
  }

  if (BORDERLINE_PATTERNS.some((p) => p.test(text))) {
    return {
      label: 'borderline',
      reason: 'Demande pouvant mener à une solution clé-en-main',
    };
  }

  return {
    label: 'allowed',
    reason: 'Demande pédagogique normale',
  };
}
