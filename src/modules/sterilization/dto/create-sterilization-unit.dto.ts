import { IsEnum, IsInt, IsString, MinLength } from 'class-validator';
import { SterilizationCase } from '../../../generated/prisma/client';

export class CreateSterilizationUnitDto {
  @IsString() @MinLength(3)
  code!: string;

  @IsInt()
  studentId!: number;

  @IsEnum(SterilizationCase)
  type!: SterilizationCase;
}