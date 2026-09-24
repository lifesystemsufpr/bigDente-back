import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':studentId')
  findOne(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.studentsService.findOne(studentId);
  }

  @Patch(':studentId')
  update(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(studentId, dto);
  }

  @Delete(':studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.studentsService.remove(studentId);
  }
}
