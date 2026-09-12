import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [companies, scoreGroups, total] = await Promise.all([
      this.prisma.company.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.application.groupBy({
        by: ['companyId'],
        where: { aiScore: { not: null } },
        _avg: { aiScore: true },
        _count: { aiScore: true },
      }),
      this.prisma.company.count(),
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

    return {
      data: companies.map((company) => ({
        ...company,
        ...(statsMap.get(company.id) ?? {
          averageScore: 0,
          totalScoredApplications: 0,
        }),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLeaderboard(limit: number = 10) {
    const scoreGroups = await this.prisma.application.groupBy({
      by: ['companyId'],
      where: { aiScore: { not: null } },
      _avg: { aiScore: true },
      _count: { aiScore: true },
      orderBy: { _avg: { aiScore: 'desc' } },
      take: limit,
    });

    if (scoreGroups.length === 0) return [];

    const companyIds = scoreGroups.map((g) => g.companyId);
    const companies = await this.prisma.company.findMany({
      where: { id: { in: companyIds } },
    });

    const companyMap = new Map(companies.map((c) => [c.id, c]));

    return scoreGroups.map((group) => ({
      ...companyMap.get(group.companyId),
      averageScore: group._avg.aiScore ?? 0,
      totalScoredApplications: group._count.aiScore,
    }));
  }

  search(query: string) {
    return this.prisma.company.findMany({
      where: {
        name: { contains: query },
      },
      select: { id: true, name: true, website: true },
      take: 10,
      orderBy: { name: 'asc' },
    });
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

  async update(
    requestUserId: number,
    requestUserRole: string,
    id: number,
    dto: CompanyDto,
  ) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id },
    });

    const isAdmin = requestUserRole === 'ADMIN';
    const isOwner = company.ownerId === requestUserId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'Bu şirketi güncellemek için yetkili değilsiniz.',
      );
    }

    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return this.prisma.company.delete({ where: { id } });
  }

  async claimCompany(companyId: number, targetUserId: number) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });

    if (company.ownerId !== null) {
      throw new ConflictException(
        'Bu şirket zaten sahiplenilmiş. Lütfen önce mevcut sahipliği kaldırın.',
      );
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: { ownerId: targetUserId },
      select: { id: true, name: true, ownerId: true },
    });
  }

  async unclaimCompany(companyId: number) {
    return this.prisma.company.update({
      where: { id: companyId },
      data: { ownerId: null },
      select: { id: true, name: true, ownerId: true },
    });
  }
}
