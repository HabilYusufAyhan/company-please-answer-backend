import { Controller, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    description:
      'Kullanıcının profil bilgileri, şirketleri ve başvuruları döner.',
  })
  @Get('me')
  getMe(@Request() req: RequestWithUser) {
    return this.userService.getMe(req.user.sub);
  }
}
