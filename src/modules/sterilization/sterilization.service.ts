import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SterilizationStatus as S } from '../../generated/prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { canTransition } from './sterilization.transitions';
import { CreateSterilizationUnitDto } from './dto/create-sterilization-unit.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QuerySterilizationDto } from './dto/query-sterilization.dto';

const CYCLE_HOURS = 24; // prazo padrão; ideal vir de config/env

@Injectable()
export class SterilizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSterilizationUnitDto) {
    try {
      return await this.prisma.sterilizationUnit.create({ data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') throw new ConflictException('Código já cadastrado');
        if (e.code === 'P2003') throw new BadRequestException('Aluno não encontrado');
      }
      throw e;
    }
  }

  findAll(q: QuerySterilizationDto) {
    return this.prisma.sterilizationUnit.findMany({
      where: { status: q.status, studentId: q.studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.sterilizationUnit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unidade não encontrada');
    return unit;
  }

  async changeStatus(id: string, dto: ChangeStatusDto) {
    const current = await this.findOne(id);

    if (!canTransition(current.status, dto.status)) {
      throw new BadRequestException(
        `Transição inválida: ${current.status} → ${dto.status}`,
      );
    }

    const now = new Date();
    const data: Prisma.SterilizationUnitUpdateInput = { status: dto.status };

    switch (dto.status) {
      case S.SUBMITTED:
        data.submittedForSterilizationAt = now;
        data.expectedSterilizationDeliveryAt = new Date(now.getTime() + CYCLE_HOURS * 3600_000);
        data.errorReason = null;
        break;
      case S.DELIVERED:
        data.sterilizationDeliveredAt = now;
        break;
      case S.ERROR:
        data.errorReason = dto.errorReason;
        break;
      case S.PENDING: // retorno de ERROR: limpa o ciclo anterior
        data.errorReason = null;
        data.submittedForSterilizationAt = null;
        data.expectedSterilizationDeliveryAt = null;
        break;
    }

    // updateMany com status atual evita corrida entre dois requests
    const { count } = await this.prisma.sterilizationUnit.updateMany({
      where: { id, status: current.status },
      data: data as Prisma.SterilizationUnitUncheckedUpdateManyInput,
    });
    if (count === 0) throw new ConflictException('Status alterado por outra requisição');

    return this.findOne(id);
  }
}