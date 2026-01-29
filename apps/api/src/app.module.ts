import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SessionsModule } from './sessions/sessions.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [PrismaModule, ProjectsModule, SessionsModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
