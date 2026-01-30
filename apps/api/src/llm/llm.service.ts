import { ensureUniPilotFormat } from './format.guard';
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UNIPILOT_SYSTEM_PROMPT } from './system.prompt';


@Injectable()
export class LlmService {
  private model;
  private modelName = 'gemini-2.0-flash';
  private readonly defaultModel = process.env.GEMINI_MODEL || 'models/gemini-2.5-flash';

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

  async generate(userMessage: string, systemPrompt: string, history: string) {
    const prompt = `${systemPrompt}\n\n${history}\n\nMESSAGE ÉTUDIANT:\n${userMessage}`;
    const raw = await this.model.generateContent(prompt);
    return { text: ensureUniPilotFormat(raw.response.text()), model: this.modelName };
  }

  async generateWithMeta(
    message: string,
    context: string,
    historyText: string = '',
  ): Promise<{ text: string; model: string }> {
    const result = await this.generate(message, context, historyText);
    return { text: result.text, model: this.defaultModel };
  }
}