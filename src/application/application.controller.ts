import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser extends ExpressRequest {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

@ApiTags('application')
@ApiBearerAuth()
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() ApplicationDto: ApplicationDto,
  ) {
    const userId = req.user.sub;

    return this.applicationService.create(userId, ApplicationDto);
  }

  @Get()
  findAllMyApplications(@Request() req: RequestWithUser) {
    const userId = req.user.sub;

    return this.applicationService.findAllByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateApplicationDto,
  ) {
    const userId = req.user.sub;
    return this.applicationService.update(userId, id, updateData);
  }
}
