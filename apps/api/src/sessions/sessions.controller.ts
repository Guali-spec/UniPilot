import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }
}
