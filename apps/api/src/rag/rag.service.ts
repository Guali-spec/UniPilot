import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';

type RagChunk = {
  id: string;
  content: string;
  filename: string;
  score: number;
};

@Injectable()
export class RagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  async buildContext(projectId: string, query: string, limit = 5) {
    const chunks = await this.search(projectId, query, limit);
    if (chunks.length === 0) return '';

    const lines: string[] = [
      'SOURCES (utilise des citations [S1], [S2], ...):',
    ];

    chunks.forEach((chunk, index) => {
      lines.push(`[S${index + 1}] ${chunk.filename}: ${chunk.content}`);
    });

    return lines.join('\n');
  }

  private async search(projectId: string, query: string, limit: number) {
    const embedding = await this.llm.embed(query);
    const vectorLiteral = `[${embedding.map((v) => Number(v) || 0).join(',')}]`;

    const rows = await this.prisma.$queryRaw<RagChunk[]>`
      SELECT c.id,
             c.content,
             d.filename,
             1 - (c.embedding <=> ${vectorLiteral}::vector) AS score
      FROM "DocumentChunk" c
      JOIN "Document" d ON d.id = c."documentId"
      WHERE d."projectId" = ${projectId}
        AND c.embedding IS NOT NULL
      ORDER BY c.embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;

    return rows ?? [];
  }
}
