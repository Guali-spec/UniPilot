import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LlmModule } from '../llm/llm.module';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [PrismaModule, LlmModule, RagModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
