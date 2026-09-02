import { AppStatus } from '@prisma/client';
import {
  IsDate,
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
export class ApplicationDto {
  @IsNotEmpty({ message: 'companyId is required' })
  @IsInt({ message: 'companyId must be a number' })
  companyId: number;

  @IsNotEmpty({ message: 'position is required' })
  @IsString({ message: 'position must be a string' })
  position: string;

  @IsNotEmpty({ message: 'appliedAt is required' })
  @Type(() => Date)
  @IsDate({ message: 'appliedAt must be a date' })
  appliedAt: Date;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;
  @IsOptional()
  @IsString()
  responseMessage?: string;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  responseReceivedAt?: Date;
}
