import { Module } from '@nestjs/common';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, PasswordService],
})
export class StudentsModule {}
