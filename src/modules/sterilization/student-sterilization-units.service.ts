import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SterilizationStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { ListUnitsQueryDto } from './dto/list-units-query.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { generateUnitCode } from './unit-code.generator';

const MAX_CODE_ATTEMPTS = 5;

@Injectable()
export class StudentSterilizationUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveStudentId(userId: number): Promise<number> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { studentId: true },
    });
    if (!student) throw new ForbiddenException('Usuário não é um aluno');
    return student.studentId;
  }

  async create(userId: number, dto: CreateUnitDto) {
    const studentId = await this.resolveStudentId(userId);

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      try {
        return await this.prisma.sterilizationUnit.create({
          data: {
            code: generateUnitCode(dto.type),
            studentId,
            type: dto.type,
            status: SterilizationStatus.PENDING,
            submittedForSterilizationAt: null,
            expectedSterilizationDeliveryAt: null,
            sterilizationDeliveredAt: null,
          },
        });
      } catch (e) {
        const isCollision =
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002';
        if (!isCollision) throw e;
      }
    }
    throw new ConflictException('Não foi possível gerar um código único');
  }

  async findAll(userId: number, q: ListUnitsQueryDto) {
    const studentId = await this.resolveStudentId(userId);

    const where: Prisma.SterilizationUnitWhereInput = {
      studentId,
      status: q.status,
      type: q.type,
      code: q.code ? { contains: q.code, mode: 'insensitive' } : undefined,
      createdAt: { gte: q.createdFrom, lte: q.createdTo },
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.sterilizationUnit.count({ where }),
      this.prisma.sterilizationUnit.findMany({
        where,
        orderBy: { [q.sortBy]: q.order },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: q.page,
        limit: q.limit,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  }

  async findOne(userId: number, id: string) {
    const studentId = await this.resolveStudentId(userId);
    const unit = await this.prisma.sterilizationUnit.findFirst({
      where: { id, studentId },
    });
    if (!unit) throw new NotFoundException('Unidade não encontrada');
    return unit;
  }

  async update(userId: number, id: string, dto: UpdateUnitDto) {
    const studentId = await this.resolveStudentId(userId);
    const { count } = await this.prisma.sterilizationUnit.updateMany({
      where: { id, studentId, status: SterilizationStatus.PENDING },
      data: { type: dto.type },
    });
    if (count === 0) await this.explainFailure(id, studentId, 'editada');
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: string) {
    const studentId = await this.resolveStudentId(userId);
    const { count } = await this.prisma.sterilizationUnit.deleteMany({
      where: { id, studentId, status: SterilizationStatus.PENDING },
    });
    if (count === 0) await this.explainFailure(id, studentId, 'excluída');
  }

  // 404 se não existe ou não é do aluno; 409 se existe mas já saiu de PENDING.
  private async explainFailure(
    id: string,
    studentId: number,
    action: string,
  ): Promise<never> {
    const exists = await this.prisma.sterilizationUnit.findFirst({
      where: { id, studentId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Unidade não encontrada');
    throw new ConflictException(
      `Unidade já recebida pela central e não pode ser ${action}`,
    );
  }
}
