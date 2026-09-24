import { Transform } from 'class-transformer';
import {
  Equals,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  normalizeEmail,
  normalizeUppercase,
  trimString,
} from '../../../common/transforms/normalize-string.transform';
import { ROLE } from '../../users/entities/role.enum';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(trimString)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  @Transform(normalizeEmail)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @IsOptional()
  @Equals(ROLE.ALUNO)
  role?: ROLE.ALUNO;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(trimString)
  code?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(normalizeUppercase)
  grr?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(trimString)
  course?: string;
}
