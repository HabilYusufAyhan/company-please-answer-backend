import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signUp(dto: SignUpDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Kullanıcı zaten mevcut');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
    });

    return {
      message: 'Kayıt işlemi başarılı',
      email: newUser.email,
      role: newUser.role,
    };
  }
  async signIn(dto: SignInDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!existingUser) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }
    const payload = {
      sub: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    };

    return {
      message: 'Giriş işlemi başarılı',
      email: existingUser.email,
      role: existingUser.role,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
