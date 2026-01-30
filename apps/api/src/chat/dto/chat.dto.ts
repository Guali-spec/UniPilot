import { IsIn, IsOptional, IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  sessionId: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsIn(['coach', 'planning', 'debug'])
  mode?: 'coach' | 'planning' | 'debug';
}
