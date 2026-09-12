import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

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

  @ApiCreatedResponse({ description: 'Başvuru başarıyla oluşturuldu.' })
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() applicationDto: ApplicationDto,
  ) {
    const userId = req.user.sub;
    return this.applicationService.create(userId, applicationDto);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({
    description: 'Başvurular listesi ve sayfalama bilgisi döner.',
  })
  @Get()
  findAllMyApplications(@Request() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.applicationService.findAllByUserId(userId);
  }

  @ApiOkResponse({ description: "Belirtilen ID'ye sahip başvuru döner." })
  @ApiNotFoundResponse({ description: 'Başvuru bulunamadı.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.findOne(id);
  }

  @ApiOkResponse({ description: 'Başvuru güncellendi.' })
  @ApiForbiddenResponse({
    description: 'Sadece kendi başvurunuzu güncelleyebilirsiniz.',
  })
  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationService.update(
      req.user.sub,
      id,
      updateApplicationDto,
    );
  }

  @ApiOkResponse({ description: 'Başvuru silindi.' })
  @ApiForbiddenResponse({
    description: 'Sadece kendi başvurunuzu silebilirsiniz.',
  })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.applicationService.remove(req.user.sub, id);
  }
}
