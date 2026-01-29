import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';
import { LlmService } from '../llm/llm.service';


@Injectable()
export class ChatService {
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

  // 1) stocker message user
  await this.prisma.chatMessage.create({
    data: { sessionId: dto.sessionId, role: 'user', content: dto.message },
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

  // 5) éviter de répéter le message courant (optionnel mais propre)
  const trimmedHistory = history.filter((m, idx) => {
    const isLast = idx === history.length - 1;
    return !(isLast && m.role === 'user' && m.content === dto.message);
  });

  // 6) historique compact
  const historyText = trimmedHistory
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  // 7) appel Gemini
  const assistantText = await this.llm.generate(dto.message, context, historyText);

  // 8) stocker réponse assistant
  const assistant = await this.prisma.chatMessage.create({
    data: { sessionId: dto.sessionId, role: 'assistant', content: assistantText },
  });

  return { sessionId: dto.sessionId, assistant };
}


  history(sessionId: string) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
