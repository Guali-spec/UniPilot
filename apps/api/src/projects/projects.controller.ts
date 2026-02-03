import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { requireUserId } from '../common/user-id';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @Headers('x-user-id') userId: string) {
    return this.service.create(dto, requireUserId(userId));
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.service.findAll(requireUserId(userId));
  }
}
