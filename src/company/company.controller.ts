import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Request,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';
import { Public } from '../auth/public.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request as ExpressRequest } from 'express';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

interface RequestWithUser extends ExpressRequest {
  user: { sub: number; email: string; role: string };
}

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Şirket başarıyla oluşturuldu.' })
  @ApiConflictResponse({ description: 'Bu şirket sistemde zaten kayıtlı!' })
  @Post()
  create(@Body() companyDto: CompanyDto) {
    return this.companyService.create(companyDto);
  }

  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({
    description: 'Şirketler listesi ve sayfalama bilgisi döner.',
  })
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.companyService.findAll(Number(page), Number(limit));
  }

  @Public()
  @ApiQuery({ name: 'q', required: true, type: String, example: 'Google' })
  @ApiOkResponse({ description: 'Arama kriterine uyan şirketler döner.' })
  @Get('search')
  search(@Query('q') q: string = '') {
    return this.companyService.search(q);
  }

  @Public()
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: 'En iyi şirketler listesi döner.' })
  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit: string = '10') {
    return this.companyService.getLeaderboard(Number(limit));
  }

  @Public()
  @ApiOkResponse({ description: 'Belirtilen isimdeki şirket döner.' })
  @ApiNotFoundResponse({ description: 'Şirket bulunamadı.' })
  @Get('name/:name')
  findOneByName(@Param('name') name: string) {
    return this.companyService.findOneByName(name);
  }

  @Public()
  @ApiOkResponse({ description: "Belirtilen ID'ye sahip şirket döner." })
  @ApiNotFoundResponse({ description: 'Şirket bulunamadı.' })
  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findOneById(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiBody({
    schema: { type: 'object', properties: { userId: { type: 'number' } } },
  })
  @ApiOkResponse({ description: 'Şirket başarıyla sahiplenildi.' })
  @ApiConflictResponse({ description: 'Bu şirket zaten sahiplenilmiş.' })
  @ApiForbiddenResponse({
    description: 'Sadece adminler şirket sahipliği atayabilir.',
  })
  @Post(':id/claim')
  claimCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) targetUserId: number,
  ) {
    return this.companyService.claimCompany(id, targetUserId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: 'Şirket sahipliği kaldırıldı.' })
  @ApiForbiddenResponse({
    description: 'Sadece adminler şirket sahipliğini kaldırabilir.',
  })
  @Delete(':id/claim')
  unclaimCompany(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.unclaimCompany(id);
  }

  @ApiBearerAuth()
  @SkipThrottle()
  @ApiOkResponse({ description: 'Şirket güncellendi.' })
  @ApiForbiddenResponse({
    description: 'Bu şirketi güncellemek için yetkili değilsiniz.',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() companyDto: CompanyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.companyService.update(
      req.user.sub,
      req.user.role,
      id,
      companyDto,
    );
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @SkipThrottle()
  @ApiOkResponse({ description: 'Şirket silindi.' })
  @ApiForbiddenResponse({ description: 'Sadece admin şirket silebilir.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.remove(id);
  }
}
