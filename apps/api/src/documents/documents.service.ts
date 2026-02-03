import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import pdfParse from 'pdf-parse';

const MAX_CHARS = 1200;
const OVERLAP = 200;
const MIN_CHUNK = 200;

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  async list(projectId: string, userId: string) {
    return this.prisma.document.findMany({
      where: { projectId, project: { userId } },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { chunks: true } } },
    });
  }

  async get(documentId: string, userId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, project: { userId } },
      include: { _count: { select: { chunks: true } } },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async remove(documentId: string, userId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, project: { userId } },
    });
    if (!doc) throw new NotFoundException('Document not found');
    await this.prisma.document.delete({ where: { id: documentId } });
    return { deleted: true };
  }

  async upload(projectId: string, file: Express.Multer.File, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (file.size <= 0) {
      throw new BadRequestException('Empty file');
    }

    const doc = await this.prisma.document.create({
      data: {
        projectId,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: 'processing',
      },
    });

    try {
      const text = await this.extractPdfText(file.buffer);
      const chunks = this.chunkText(text);
      if (chunks.length === 0) {
        throw new BadRequestException('Document is too small to index');
      }

      for (let i = 0; i < chunks.length; i += 1) {
        const content = chunks[i];
        const chunk = await this.prisma.documentChunk.create({
          data: { documentId: doc.id, index: i, content },
        });

        const embedding = await this.llm.embed(content);
        const vectorLiteral = `[${embedding.map((v) => Number(v) || 0).join(',')}]`;
        await this.prisma.$executeRawUnsafe(
          `UPDATE "DocumentChunk" SET "embedding" = '${vectorLiteral}'::vector WHERE "id" = '${chunk.id}'`,
        );
      }

      await this.prisma.document.update({
        where: { id: doc.id },
        data: { status: 'ready' },
      });
      return doc;
    } catch (error) {
      await this.prisma.document.update({
        where: { id: doc.id },
        data: { status: 'failed' },
      });
      throw new InternalServerErrorException(
        'Failed to process document. Please try another PDF.',
      );
    }
  }

  private async extractPdfText(buffer: Buffer) {
    const data = await pdfParse(buffer);
    const text = (data.text ?? '').replace(/\s+/g, ' ').trim();
    if (!text) {
      throw new BadRequestException('No text found in PDF');
    }
    return text;
  }

  private chunkText(text: string) {
    const chunks: string[] = [];
    const normalized = text.replace(/\s+/g, ' ').trim();

    if (normalized.length <= MAX_CHARS) {
      return normalized.length >= MIN_CHUNK ? [normalized] : [];
    }

    for (let i = 0; i < normalized.length; i += MAX_CHARS - OVERLAP) {
      const slice = normalized.slice(i, i + MAX_CHARS);
      if (slice.length >= MIN_CHUNK) {
        chunks.push(slice);
      }
    }

    return chunks;
  }
}
