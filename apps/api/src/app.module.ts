import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SessionsModule } from './sessions/sessions.module';
import { ChatModule } from './chat/chat.module';
import { LlmModule } from './llm/llm.module';
import { DocumentsModule } from './documents/documents.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    SessionsModule,
    ChatModule,
    LlmModule,
    DocumentsModule,
    RagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
