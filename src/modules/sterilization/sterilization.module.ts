import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StudentSterilizationUnitsController } from './student-sterilization-units.controller';
import { StudentSterilizationUnitsService } from './student-sterilization-units.service';
import { SterilizationController } from './sterilization.controller';
import { SterilizationService } from './sterilization.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [StudentSterilizationUnitsController, SterilizationController],
  providers: [
    StudentSterilizationUnitsService,
    SterilizationService,
    JwtAuthGuard,
  ],
})
export class SterilizationModule {}
