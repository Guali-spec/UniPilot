import 'dotenv/config';

const key = process.env.GOOGLE_AI_STUDIO_API_KEY;

if (!key) {
  console.error('❌ GOOGLE_AI_STUDIO_API_KEY is missing');
  process.exit(1);
}

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
);

const json = await res.json();

// On affiche uniquement les infos utiles
const models = json.models?.map(m => ({
  name: m.name,
  displayName: m.displayName,
  supportedGenerationMethods: m.supportedGenerationMethods,
}));

console.log(JSON.stringify(models, null, 2));
