import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { requireUserId } from '../common/user-id';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto, @Headers('x-user-id') userId: string) {
    return this.sessionsService.create(dto, requireUserId(userId));
  }

  @Get()
  list(
    @Query('projectId') projectId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.sessionsService.findByProject(projectId, requireUserId(userId));
  }

  @Get(':sessionId/anti-cheat')
  antiCheat(
    @Param('sessionId') sessionId: string,
    @Query('take') take?: string,
    @Headers('x-user-id') userId?: string,
  ) {
    const limit = take ? Math.min(parseInt(take, 10) || 50, 200) : 50;
    return this.sessionsService.antiCheatEvents(
      sessionId,
      limit,
      requireUserId(userId),
    );
  }
}
