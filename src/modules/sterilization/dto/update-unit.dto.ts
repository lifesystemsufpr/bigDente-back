import { IsEnum } from 'class-validator';
import { SterilizationCase } from '../../../generated/prisma/client';

// Só o tipo é editável: código é gerado; status e datas pertencem ao fluxo operacional.
export class UpdateUnitDto {
  @IsEnum(SterilizationCase)
  type!: SterilizationCase;
}
