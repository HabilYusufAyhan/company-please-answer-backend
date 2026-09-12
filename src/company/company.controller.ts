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
import { ApiTags, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { sub: number; email: string; role: string };
}

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() companyDto: CompanyDto) {
    return this.companyService.create(companyDto);
  }

  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.companyService.findAll(Number(page), Number(limit));
  }

  @Public()
  @ApiQuery({ name: 'q', required: true, type: String, example: 'Google' })
  @Get('search')
  search(@Query('q') q: string = '') {
    return this.companyService.search(q);
  }

  @Public()
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit: string = '10') {
    return this.companyService.getLeaderboard(Number(limit));
  }

  @Public()
  @Get('name/:name')
  findOneByName(@Param('name') name: string) {
    return this.companyService.findOneByName(name);
  }

  @Public()
  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findOneById(id);
  }

  @ApiBearerAuth()
  @ApiBody({
    schema: { type: 'object', properties: { userId: { type: 'number' } } },
  })
  @Post(':id/claim')
  claimCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) targetUserId: number,
    @Request() req: RequestWithUser,
  ) {
    return this.companyService.claimCompany(id, targetUserId, req.user.role);
  }

  @ApiBearerAuth()
  @Delete(':id/claim')
  unclaimCompany(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.companyService.unclaimCompany(id, req.user.role);
  }

  @ApiBearerAuth()
  @SkipThrottle()
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
  @SkipThrottle()
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.companyService.remove(req.user.sub, req.user.role, id);
  }
}
