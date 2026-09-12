import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CompanyDto {
  @IsString({ message: 'Şirket adı metin olmalıdır' })
  name: string;

  @IsOptional()
  @IsUrl({}, { message: 'Geçerli bir URL giriniz' })
  website?: string;
}
