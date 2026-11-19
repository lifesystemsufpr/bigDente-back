import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SterilizationStatus } from '../../../generated/prisma/client';

export class QuerySterilizationDto {
  @IsOptional() @IsEnum(SterilizationStatus)
  status?: SterilizationStatus;

  @IsOptional() @Type(() => Number) @IsInt()
  studentId?: number;
}