import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { Public } from './public.decorator';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiCreatedResponse({ description: 'Kayıt işlemi başarılı' })
  @ApiConflictResponse({ description: 'Kullanıcı zaten mevcut' })
  @Post('signup')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Public()
  @ApiOkResponse({ description: 'Giriş işlemi başarılı (JWT döner)' })
  @ApiUnauthorizedResponse({ description: 'E-posta veya şifre hatalı' })
  @Post('signin')
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }
}
