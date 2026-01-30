import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.sessionsService.findByProject(projectId);
  }

  @Get(':sessionId/anti-cheat')
  antiCheat(
    @Param('sessionId') sessionId: string,
    @Query('take') take?: string,
  ) {
    const limit = take ? Math.min(parseInt(take, 10) || 50, 200) : 50;
    return this.sessionsService.antiCheatEvents(sessionId, limit);
  }
}
