import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!dto.projectId) {
      throw new BadRequestException('projectId is required');
    }
    if (!file) {
      throw new BadRequestException('file is required');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }
    return this.documentsService.upload(dto.projectId, file);
  }

  @Get()
  list(@Query('projectId') projectId: string) {
    if (!projectId) {
      throw new BadRequestException('projectId is required');
    }
    return this.documentsService.list(projectId);
  }

  @Get(':documentId')
  get(@Param('documentId') documentId: string) {
    return this.documentsService.get(documentId);
  }

  @Delete(':documentId')
  remove(@Param('documentId') documentId: string) {
    return this.documentsService.remove(documentId);
  }
}
