import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.login.trim().toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Login ou senha inválidos');
    }

    const passwordIsValid = await this.passwordService.verify(
      dto.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Login ou senha inválidos');
    }

    const tokens = await this.generateTokens(user);

    const refreshTokenHash = await this.passwordService.hash(
      tokens.refreshToken,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return tokens;
  }

  async refreshToken(dto: RefreshTokenDto) {
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    let payload: { sub: number };

    try {
      payload = await this.jwtService.verifyAsync<{ sub: number }>(
        dto.refreshToken,
        { secret: refreshSecret },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const tokenIsValid = await this.passwordService.verify(
      dto.refreshToken,
      user.refreshTokenHash,
    );

    if (!tokenIsValid) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const tokens = await this.generateTokens(user);

    const refreshTokenHash = await this.passwordService.hash(
      tokens.refreshToken,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      newToken: tokens.token,
      refreshToken: tokens.refreshToken,
    };
  }

  private async generateTokens(user: {
    id: number;
    name: string;
    email: string;
    role: string;
  }) {
    const accessSecret =
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { token, refreshToken };
  }
}