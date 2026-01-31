import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    try {
      await this.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');
    } catch (error) {
      console.warn('[prisma] unable to create pgvector extension');
    }

    try {
      await this.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_idx" ON "DocumentChunk" USING ivfflat (embedding vector_cosine_ops)',
      );
    } catch (error) {
      console.warn('[prisma] unable to create pgvector index');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
