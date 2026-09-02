import { ForbiddenException, Injectable } from '@nestjs/common';
import { ApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, ApplicationDto: ApplicationDto) {
    return this.prisma.application.create({
      data: {
        position: ApplicationDto.position,
        appliedAt: ApplicationDto.appliedAt,
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

  async update(userId: number, id: number, updateData: UpdateApplicationDto) {
    const application = await this.prisma.application.findUniqueOrThrow({
      where: { id },
    });

    if (application.userId !== userId) {
      throw new ForbiddenException(
        'Size ait olmayan bir başvuruyu güncelleyemezsiniz!',
      );
    }

    return this.prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
      },
    });
  }
}
