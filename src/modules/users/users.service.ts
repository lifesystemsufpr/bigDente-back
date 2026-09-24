import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ROLE } from './entities/role.enum';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          ...dto,
          password: await this.passwordService.hash(dto.password),
        },
        select: publicUserSelect,
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, student: { select: { studentId: true } } },
    });

    if (!currentUser) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

    if (currentUser.student && dto.role && dto.role !== ROLE.ALUNO) {
      throw new ConflictException(
        'Um usuário vinculado a um aluno deve manter o papel ALUNO',
      );
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: dto.name,
          email: dto.email,
          role: dto.role,
          password: dto.password
            ? await this.passwordService.hash(dto.password)
            : undefined,
        },
        select: publicUserSelect,
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }

  private handleDatabaseError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Já existe um usuário com este e-mail');
    }

    throw error;
  }
}
