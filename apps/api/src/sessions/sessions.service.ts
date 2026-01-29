import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSessionDto) {
    return this.prisma.chatSession.create({
      data: { projectId: dto.projectId, name: dto.name },
    });
  }

  findByProject(projectId: string) {
    return this.prisma.chatSession.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
