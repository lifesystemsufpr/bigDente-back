import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { ROLE } from '../users/entities/role.enum';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

const studentWithUser = {
  studentId: true,
  code: true,
  grr: true,
  course: true,
  userId: true,
  user: {
    select: { id: true, name: true, email: true, role: true },
  },
} satisfies Prisma.StudentSelect;

type StudentWithUser = Prisma.StudentGetPayload<{
  select: typeof studentWithUser;
}>;

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(dto: CreateStudentDto) {
    try {
      const student = await this.prisma.$transaction(async (transaction) => {
        const user = await transaction.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            password: await this.passwordService.hash(dto.password),
            role: ROLE.ALUNO,
          },
          select: { id: true },
        });

        return transaction.student.create({
          data: {
            code: dto.code,
            grr: dto.grr,
            course: dto.course,
            userId: user.id,
          },
          select: studentWithUser,
        });
      });

      return this.toResponse(student);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll() {
    const students = await this.prisma.student.findMany({
      select: studentWithUser,
      orderBy: { studentId: 'asc' },
    });

    return students.map((student) => this.toResponse(student));
  }

  async findOne(studentId: number) {
    const student = await this.findEntity(studentId);
    return this.toResponse(student);
  }

  async update(studentId: number, dto: UpdateStudentDto) {
    const currentStudent = await this.findEntity(studentId);

    try {
      const student = await this.prisma.$transaction(async (transaction) => {
        await transaction.user.update({
          where: { id: currentStudent.userId },
          data: {
            name: dto.name,
            email: dto.email,
            role: dto.role,
            password: dto.password
              ? await this.passwordService.hash(dto.password)
              : undefined,
          },
        });

        return transaction.student.update({
          where: { studentId },
          data: {
            code: dto.code,
            grr: dto.grr,
            course: dto.course,
          },
          select: studentWithUser,
        });
      });

      return this.toResponse(student);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(studentId: number) {
    const student = await this.findEntity(studentId);
    await this.prisma.user.delete({ where: { id: student.userId } });
  }

  private async findEntity(studentId: number): Promise<StudentWithUser> {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      select: studentWithUser,
    });

    if (!student) {
      throw new NotFoundException(`Aluno ${studentId} não encontrado`);
    }

    return student;
  }

  private toResponse(student: StudentWithUser) {
    const { user, ...studentData } = student;
    return { ...user, ...studentData };
  }

  private handleDatabaseError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('E-mail, código ou GRR já cadastrado');
    }

    throw error;
  }
}
