import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        companies: {
          select: {
            id: true,
            name: true,
            website: true,
            aiOpinion: true,
            createdAt: true,
          },
        },
        Application: {
          select: {
            id: true,
            position: true,
            status: true,
            aiScore: true,
            appliedAt: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }
}
