import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AccountController],
  providers: [AccountService, PasswordService, JwtAuthGuard],
})
export class AccountModule {}
