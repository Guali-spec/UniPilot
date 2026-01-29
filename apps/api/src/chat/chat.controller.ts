import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

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
}
