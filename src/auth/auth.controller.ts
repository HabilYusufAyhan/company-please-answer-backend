import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }
}
