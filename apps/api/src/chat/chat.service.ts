import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';
import { LlmService } from '../llm/llm.service';
import { detectCheating } from '../llm/cheat.detector';
import { buildAntiCheatInstruction } from '../llm/anti-cheat.policy';


@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private llm: LlmService,
    
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

    

    const t0 = Date.now();
const llmResult = await this.llm.generate(
  userMessage,
  `${modeHint}\n${antiCheatInstruction}\n${context}`,
  historyText,
);
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
}
