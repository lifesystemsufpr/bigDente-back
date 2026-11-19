import { IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { SterilizationStatus } from '../../../generated/prisma/client';

export class ChangeStatusDto {
  @IsEnum(SterilizationStatus)
  status!: SterilizationStatus;

  // obrigatório quando status = ERROR
  @ValidateIf((o) => o.status === SterilizationStatus.ERROR)
  @IsString() @MinLength(5)
  errorReason?: string;
}