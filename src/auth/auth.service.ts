import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signUp(dto: SignUpDto) {
    return {
      message: 'Kullanıcı kayıt işlemi başarılı olacak',
      email: dto.email,
      role: dto.role,
    };
  }
}
