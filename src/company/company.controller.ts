import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';
import { Public } from '../auth/public.decorator';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() CompanyDto: CompanyDto) {
    return this.companyService.create(CompanyDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.companyService.findAll();
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

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() CompanyDto: CompanyDto,
  ) {
    return this.companyService.update(id, CompanyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.remove(id);
  }
}
