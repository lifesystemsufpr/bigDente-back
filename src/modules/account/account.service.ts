import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuário ${userId} não encontrado`);
    }

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, password: true },
    });

    if (user) {
      const token = await this.jwtService.signAsync(
        { sub: user.id },
        { secret: this.resetSecret(user.password), expiresIn: '15m' },
      );

      this.logger.log(
        `Token de redefinição de senha para ${user.email}: ${token}`,
      );
    }

    return {
      message:
        'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const payload = this.jwtService.decode<{ sub?: number } | null>(dto.token);

    const user = payload?.sub
      ? await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, password: true },
        })
      : null;

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    try {
      await this.jwtService.verifyAsync(dto.token, {
        secret: this.resetSecret(user.password),
      });
    } catch {
      throw new BadRequestException('Token inválido ou expirado');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await this.passwordService.hash(dto.password),
        refreshTokenHash: null,
      },
    });
  }

  private resetSecret(passwordHash: string) {
    return `${this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')}${passwordHash}`;
  }
}
