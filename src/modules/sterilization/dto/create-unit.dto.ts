import { IsEnum } from 'class-validator';
import { SterilizationCase } from '../../../generated/prisma/client';

export class CreateUnitDto {
  @IsEnum(SterilizationCase)
  type!: SterilizationCase;
}
