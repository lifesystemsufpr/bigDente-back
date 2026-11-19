import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { SterilizationService } from './sterilization.service';
import { CreateSterilizationUnitDto } from './dto/create-sterilization-unit.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QuerySterilizationDto } from './dto/query-sterilization.dto';

@Controller('sterilization-units')
export class SterilizationController {
  constructor(private readonly service: SterilizationService) {}

  @Post() create(@Body() dto: CreateSterilizationUnitDto) { return this.service.create(dto); }
  @Get() findAll(@Query() q: QuerySterilizationDto) { return this.service.findAll(q); }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id/status')
  changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ChangeStatusDto) {
    return this.service.changeStatus(id, dto);
  }
}