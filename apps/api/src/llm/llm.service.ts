import { ensureUniPilotFormat } from './format.guard';
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UNIPILOT_SYSTEM_PROMPT } from './system.prompt';

@Injectable()
export class LlmService {
  private model;

  constructor() {
    console.log(
  'GOOGLE_AI_STUDIO_API_KEY loaded?',
  !!process.env.GOOGLE_AI_STUDIO_API_KEY,
);

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_AI_STUDIO_API_KEY!,
    );

    this.model = genAI.getGenerativeModel({
  model: 'models/gemini-2.5-flash',
  systemInstruction: UNIPILOT_SYSTEM_PROMPT,
});

  }

async generate(userMessage: string, context?: string, history?: string) {
  const promptParts = [
    context ? `CONTEXTE PROJET:\n${context}` : '',
    history ? `HISTORIQUE (récent):\n${history}` : '',
    `MESSAGE ÉTUDIANT:\n${userMessage}`,
  ].filter(Boolean);

  const prompt = promptParts.join('\n\n');

  try {
    const result = await this.model.generateContent(prompt);
    const raw = result.response.text();
    return ensureUniPilotFormat(raw);

    return result.response.text();
  } catch (err: any) {
    console.error('Gemini error details:', err);
    throw new Error(`Gemini failed: ${err?.message ?? 'unknown error'}`);
  }
}
}