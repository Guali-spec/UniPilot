import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSessionDto, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, userId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.prisma.chatSession.create({
      data: { projectId: dto.projectId, name: dto.name },
    });
  }

  async antiCheatEvents(sessionId: string, take = 50, userId: string) {
    return this.prisma.antiCheatEvent.findMany({
      where: { sessionId, session: { project: { userId } } },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }


  findByProject(projectId: string, userId: string) {
    return this.prisma.chatSession.findMany({
      where: { projectId, project: { userId } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
