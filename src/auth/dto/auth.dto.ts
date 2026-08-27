import { Role } from '@prisma/client';

export class SignUpDto {
  email: string;
  password: string;
  role: Role;
}

export class SignInDto {
  email: string;
  password: string;
}
