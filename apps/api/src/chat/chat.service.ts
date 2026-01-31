import {
  Injectable,
  NotFoundException,
  Logger,
  GatewayTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';
import {
  LlmService,
  LlmTimeoutError,
  LlmUpstreamError,
} from '../llm/llm.service';
import { detectCheating } from '../llm/cheat.detector';
import { buildAntiCheatInstruction } from '../llm/anti-cheat.policy';
import { RagService } from '../rag/rag.service';


@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private llm: LlmService,
    private rag: RagService,
    
  ) {}

  async send(dto: ChatDto) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: dto.sessionId },
      include: { project: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    // Normaliser pour limiter les faux négatifs (espaces, etc.)
    const userMessage = (dto.message ?? '').trim();

    // 8.2.1 — Détection de triche
const cheatDetection = detectCheating(userMessage);
const antiCheatInstruction = buildAntiCheatInstruction(cheatDetection);

// mode must be defined before using it in the DB log
const mode = dto.mode ?? 'coach';

await this.prisma.antiCheatEvent.create({
  data: {
    sessionId: dto.sessionId,
    label: cheatDetection.label,
    reason: cheatDetection.reason,
    mode,
    message: userMessage.slice(0, 500), // garde une trace courte
  },
});


    this.logger.log(
  `[anti-cheat] session=${dto.sessionId} label=${cheatDetection.label} reason=${cheatDetection.reason}`,
);



    // 1) stocker message user
    await this.prisma.chatMessage.create({
      data: { sessionId: dto.sessionId, role: 'user', content: userMessage },
    });

    // 2) construire le contexte projet
    const context = `
Projet: ${session.project.title}
Niveau: ${session.project.level ?? 'non précisé'}
Domaine: ${session.project.domain ?? 'non précisé'}
Stack: ${session.project.stack ?? 'non précisé'}
Contraintes: ${session.project.constraints ?? 'aucune'}
`;

    // 3) récupérer les 10 derniers messages (mémoire courte)
    const lastMessages = await this.prisma.chatMessage.findMany({
      where: { sessionId: dto.sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 4) remettre dans l’ordre chronologique
    const history = lastMessages.reverse();

    // 5) éviter de répéter le message courant
    const trimmedHistory = history.filter((m, idx) => {
      const isLast = idx === history.length - 1;
      return !(isLast && m.role === 'user' && m.content === userMessage);
    });

    // 6) historique compact
    const MAX_CHARS_PER_MESSAGE = 800;

    const historyText = trimmedHistory
      .map((m) => {
        const content =
          m.content.length > MAX_CHARS_PER_MESSAGE
            ? m.content.slice(0, MAX_CHARS_PER_MESSAGE) + '…'
            : m.content;

        return `${m.role.toUpperCase()}: ${content}`;
      })
      .join('\n');

    // 7) appel Gemini
    const modeHint = `MODE: ${mode}`;
    const languageHint = `LANGUAGE: ${dto.lang === 'fr' ? 'French' : 'English'}`;

    

const t0 = Date.now();
let ragContext = '';
try {
  ragContext = await this.rag.buildContext(
    session.projectId,
    userMessage,
    5,
  );
} catch (error) {
  this.logger.warn(
    `[rag] failed session=${dto.sessionId} msg="${userMessage.slice(0, 80)}"`,
  );
}
const fullContext = ragContext
  ? `${modeHint}\n${languageHint}\n${antiCheatInstruction}\n${context}\n${ragContext}`
  : `${modeHint}\n${languageHint}\n${antiCheatInstruction}\n${context}`;
let llmResult;
  try {
  llmResult = await this.llm.generate(
    userMessage,
    fullContext,
    historyText,
  );
} catch (err) {
  if (err instanceof LlmTimeoutError) {
    this.logger.warn(
      `[llm] timeout session=${dto.sessionId} msg="${userMessage.slice(0, 80)}"`,
    );
    throw new GatewayTimeoutException(
      'LLM_TIMEOUT: The model took too long to respond. Try again.',
    );
  }
  if (err instanceof LlmUpstreamError) {
    this.logger.error(
      `[llm] upstream error session=${dto.sessionId} msg="${userMessage.slice(0, 80)}"`,
    );
    throw new ServiceUnavailableException(
      'LLM_UPSTREAM: The model is unavailable right now. Please retry shortly.',
    );
  }
  this.logger.error(
    `[llm] unexpected error session=${dto.sessionId} msg="${userMessage.slice(0, 80)}"`,
  );
  throw new ServiceUnavailableException(
    'LLM_ERROR: Unexpected error while contacting the model.',
  );
}
const latencyMs = Date.now() - t0;

const assistantText = llmResult.text;
const model = llmResult.model;

    // 8) stocker réponse assistant
    const assistant = await this.prisma.chatMessage.create({
      data: { sessionId: dto.sessionId, role: 'assistant', content: assistantText },
    });

   return {
  sessionId: dto.sessionId,
  assistant,
  antiCheat: cheatDetection,
  meta: {
    mode,
    model,
    latencyMs,
  },
};


  }

  history(sessionId: string) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async export(sessionId: string, format: 'md' | 'json' = 'md') {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        project: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    if (format === 'json') {
      return {
        project: {
          id: session.projectId,
          title: session.project.title,
        },
        session: {
          id: session.id,
          name: session.name,
          createdAt: session.createdAt,
        },
        messages: session.messages,
      };
    }

    const lines: string[] = [
      '# UniPilot Chat Export',
      `Project: ${session.project.title}`,
      `Session: ${session.name ?? ''}`,
      `Generated: ${new Date().toISOString()}`,
      '',
    ];

    for (const msg of session.messages) {
      const roleTitle = msg.role === 'user' ? 'User' : 'Assistant';
      lines.push(`## ${roleTitle}`);
      lines.push(msg.content);
      lines.push('');
    }

    return lines.join('\n');
  }
}
