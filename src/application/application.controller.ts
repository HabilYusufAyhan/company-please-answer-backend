import { Controller, Get, Post, Body, Request, Param } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationDto } from './dto/application.dto';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

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
}
