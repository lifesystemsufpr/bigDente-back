import { Module } from '@nestjs/common';
import { SterilizationController } from './sterilization.controller';
import { SterilizationService } from './sterilization.service';

@Module({
  controllers: [SterilizationController],
  providers: [SterilizationService],
})
export class SterilizationModule {}