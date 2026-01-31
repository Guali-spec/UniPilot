export function ensureUniPilotFormat(text: string): string {
  const requiredHeadings = [
    '## Reponse',
    '## Questions',
    '## Prochaine action',
  ];

  const hasAll = requiredHeadings.every((h) => text.includes(h));
  if (hasAll) return text;

  return `## Reponse
- ${text.trim().slice(0, 260)}${text.trim().length > 260 ? '...' : ''}

## Questions (si necessaire)
- Aucune

## Prochaine action
- Donne ton objectif principal et 2 contraintes.
`;
}
