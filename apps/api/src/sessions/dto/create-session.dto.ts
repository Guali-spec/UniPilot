import { IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  name?: string;
}
