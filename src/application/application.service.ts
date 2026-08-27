import { Injectable } from '@nestjs/common';
import { ApplicationDto } from './dto/application.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, ApplicationDto: ApplicationDto) {
    return this.prisma.application.create({
      data: {
        position: ApplicationDto.position,
        appliedAt: new Date(ApplicationDto.appliedAt),
        company: {
          connect: { id: ApplicationDto.companyId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        company: true,
      },
    });
  }

  findAllByUserId(userId: number) {
    return this.prisma.application.findMany({
      where: {
        userId: userId,
      },
      include: {
        company: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.application.findUniqueOrThrow({
      where: { id },
      include: {
        company: true,
      },
    });
  }
}
