import { ConflictException, Injectable } from '@nestjs/common';
import { CompanyDto } from './dto/company.dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(CompanyDto: CompanyDto) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { name: CompanyDto.name },
    });

    if (existingCompany) {
      throw new ConflictException('Bu şirket sistemde zaten kayıtlı!');
    }

    return this.prisma.company.create({
      data: {
        name: CompanyDto.name,
        website: CompanyDto.website,
      },
    });
  }

  findAll() {
    return this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  findOneByName(name: string) {
    return this.prisma.company.findUniqueOrThrow({
      where: { name },
    });
  }

  findOneById(id: number) {
    return this.prisma.company.findUniqueOrThrow({
      where: { id },
    });
  }

  update(id: number, CompanyDto: CompanyDto) {
    return this.prisma.company.update({
      where: { id },
      data: CompanyDto,
    });
  }
  remove(id: number) {
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
