import { IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  sessionId: string;

  @IsString()
  message: string;
}
