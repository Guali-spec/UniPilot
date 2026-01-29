import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

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

    // 2) réponse assistant MOCK
    const assistantText =
      `Plan (mock) pour "${session.project.title}":\n` +
      `- Clarifier objectifs\n- Définir stack\n- Lister contraintes\n` +
      `Envoie le sujet détaillé pour continuer.`;

    // 3) stocker réponse assistant
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
