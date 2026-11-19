import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  SterilizationCase,
  SterilizationStatus,
} from '../../../generated/prisma/client';

export class ListUnitsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsEnum(SterilizationStatus)
  status?: SterilizationStatus;

  @IsOptional()
  @IsEnum(SterilizationCase)
  type?: SterilizationCase;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdTo?: Date;

  @IsOptional()
  @IsIn(['createdAt', 'code', 'status'])
  sortBy: 'createdAt' | 'code' | 'status' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
