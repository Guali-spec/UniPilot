import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import type { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post()
  send(@Body() dto: ChatDto) {
    return this.service.send(dto);
  }

  @Get('history')
  history(@Query('sessionId') sessionId: string) {
    return this.service.history(sessionId);
  }

  @Get('export')
  async export(
    @Query('sessionId') sessionId: string,
    @Query('format') format: 'md' | 'json' = 'md',
    @Res() res: Response,
  ) {
    if (!sessionId) throw new BadRequestException('sessionId is required');

    const normalized = format === 'json' ? 'json' : 'md';
    const result = await this.service.export(sessionId, normalized);

    if (normalized === 'json') {
      return res.json(result);
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    return res.send(result);
  }
}
