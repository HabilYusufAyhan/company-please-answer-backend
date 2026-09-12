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

  async findAll() {
    const [companies, scoreGroups] = await Promise.all([
      this.prisma.company.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.groupBy({
        by: ['companyId'],
        where: { aiScore: { not: null } },
        _avg: { aiScore: true },
        _count: { aiScore: true },
      }),
    ]);

    const statsMap = new Map(
      scoreGroups.map((group) => [
        group.companyId,
        {
          averageScore: group._avg.aiScore ?? 0,
          totalScoredApplications: group._count.aiScore,
        },
      ]),
    );

    return companies.map((company) => ({
      ...company,
      ...(statsMap.get(company.id) ?? {
        averageScore: 0,
        totalScoredApplications: 0,
      }),
    }));
  }
  async findOneByName(name: string) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { name },
    });
    const stats = await this.prisma.application.aggregate({
      where: {
        companyId: company.id,
        aiScore: { not: null },
      },
      _avg: {
        aiScore: true,
      },
      _count: {
        aiScore: true,
      },
    });
    return {
      ...company,
      averageScore: stats._avg.aiScore || 0,
      totalScoredApplications: stats._count.aiScore,
    };
  }

  async findOneById(id: number) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id },
    });
    const stats = await this.prisma.application.aggregate({
      where: {
        companyId: company.id,
        aiScore: { not: null },
      },
      _avg: {
        aiScore: true,
      },
      _count: {
        aiScore: true,
      },
    });
    return {
      ...company,
      averageScore: stats._avg.aiScore || 0,
      totalScoredApplications: stats._count.aiScore,
    };
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
