import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import type { Response } from 'express';
import { requireUserId } from '../common/user-id';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post()
  send(@Body() dto: ChatDto, @Headers('x-user-id') userId: string) {
    return this.service.send(dto, requireUserId(userId));
  }

  @Get('history')
  history(
    @Query('sessionId') sessionId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.history(sessionId, requireUserId(userId));
  }

  @Get('export')
  async export(
    @Query('sessionId') sessionId: string,
    @Query('format') format: 'md' | 'json' = 'md',
    @Headers('x-user-id') userId: string,
    @Res() res: Response,
  ) {
    if (!sessionId) throw new BadRequestException('sessionId is required');

    const normalized = format === 'json' ? 'json' : 'md';
    const result = await this.service.export(
      sessionId,
      normalized,
      requireUserId(userId),
    );

    if (normalized === 'json') {
      return res.json(result);
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    return res.send(result);
  }
}
