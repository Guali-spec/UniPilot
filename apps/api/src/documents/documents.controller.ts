import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
import { requireUserId } from '../common/user-id';

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
    @Headers('x-user-id') userId: string,
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
    return this.documentsService.upload(
      dto.projectId,
      file,
      requireUserId(userId),
    );
  }

  @Get()
  list(
    @Query('projectId') projectId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!projectId) {
      throw new BadRequestException('projectId is required');
    }
    return this.documentsService.list(projectId, requireUserId(userId));
  }

  @Get(':documentId')
  get(
    @Param('documentId') documentId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.documentsService.get(documentId, requireUserId(userId));
  }

  @Delete(':documentId')
  remove(
    @Param('documentId') documentId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.documentsService.remove(documentId, requireUserId(userId));
  }
}
