import { IsString } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  projectId: string;
}
