import { ensureUniPilotFormat } from './format.guard';
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UNIPILOT_SYSTEM_PROMPT } from './system.prompt';

export class LlmTimeoutError extends Error {
  code = 'LLM_TIMEOUT';
}

export class LlmUpstreamError extends Error {
  code = 'LLM_UPSTREAM';
}


@Injectable()
export class LlmService {
  private model;
  private embeddingModel;
  private readonly modelName =
    process.env.GEMINI_MODEL ?? 'models/gemini-2.5-flash';
  private readonly embeddingModelName =
    process.env.GEMINI_EMBEDDING_MODEL ?? 'models/text-embedding-004';
  private readonly timeoutMs =
    parseInt(process.env.LLM_TIMEOUT_MS ?? '20000', 10) || 20000;

  constructor() {
    console.log(
      'GOOGLE_AI_STUDIO_API_KEY loaded?',
      !!process.env.GOOGLE_AI_STUDIO_API_KEY,
    );

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_AI_STUDIO_API_KEY!,
    );

    this.model = genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: UNIPILOT_SYSTEM_PROMPT,
    });

    this.embeddingModel = genAI.getGenerativeModel({
      model: this.embeddingModelName,
    });
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const error = new LlmTimeoutError(
          `LLM request timed out after ${this.timeoutMs}ms`,
        );
        reject(error);
      }, this.timeoutMs);

      promise
        .then((value) => resolve(value))
        .catch((err) => reject(err))
        .finally(() => clearTimeout(timer));
    });
  }

  async generate(userMessage: string, systemPrompt: string, history: string) {
    const prompt = `${systemPrompt}\n\n${history}\n\nMESSAGE ÉTUDIANT:\n${userMessage}`;
    let raw;
    try {
      raw = await this.withTimeout(this.model.generateContent(prompt));
    } catch (err) {
      if (err instanceof LlmTimeoutError) {
        throw err;
      }
      throw new LlmUpstreamError('LLM upstream error');
    }
    return {
      text: ensureUniPilotFormat(raw.response.text()),
      model: this.modelName,
    };
  }

  async embed(text: string): Promise<number[]> {
    let raw;
    try {
      raw = await this.withTimeout(this.embeddingModel.embedContent(text));
    } catch (err) {
      if (err instanceof LlmTimeoutError) {
        throw err;
      }
      throw new LlmUpstreamError('LLM embedding error');
    }

    const values = raw?.embedding?.values ?? [];
    if (!Array.isArray(values) || values.length === 0) {
      throw new LlmUpstreamError('LLM embedding response invalid');
    }
    return values as number[];
  }

  async generateWithMeta(
    message: string,
    context: string,
    historyText: string = '',
  ): Promise<{ text: string; model: string }> {
    const result = await this.generate(message, context, historyText);
    return { text: result.text, model: this.modelName };
  }
}
