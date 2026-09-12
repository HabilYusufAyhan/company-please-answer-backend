import { ForbiddenException, Injectable } from '@nestjs/common';
import { ApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

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
    let calculatedAiScore: number | undefined = undefined;
    if (updateData.responseMessage) {
      calculatedAiScore = await this.aiService.analyzeResponse(
        updateData.responseMessage,
      );
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: {
        ...updateData,
        aiScore: calculatedAiScore,
      },
      include: {
        company: true,
      },
    });

    if (calculatedAiScore && calculatedAiScore > 0) {
      const allEvaluations = await this.prisma.application.findMany({
        where: {
          companyId: application.companyId,
          aiScore: { not: null },
          responseMessage: { not: null },
          responseReceivedAt: { not: null },
        },
        orderBy: { responseReceivedAt: 'desc' },
        take: 50,
        select: {
          aiScore: true,
          responseMessage: true,
          responseReceivedAt: true,
        },
      });

      allEvaluations.reverse();

      const evaluations = allEvaluations.map((e) => ({
        date: e.responseReceivedAt!.toISOString().split('T')[0],
        score: e.aiScore!,
        message: e.responseMessage!,
      }));

      const opinion = await this.aiService.generateCompanyOpinion(evaluations);

      if (opinion) {
        await this.prisma.company.update({
          where: { id: application.companyId },
          data: {
            aiOpinion: opinion,
            aiOpinionUpdatedAt: new Date(),
          },
        });
      }
    }

    return updatedApplication;
  }
}
