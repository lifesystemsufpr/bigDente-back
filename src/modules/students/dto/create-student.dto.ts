import { Transform } from 'class-transformer';
import {
  Equals,
  IsEmail,
  IsNotEmpty,
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

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(trimString)
  name!: string;

  @IsEmail()
  @MaxLength(255)
  @Transform(normalizeEmail)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Equals(ROLE.ALUNO)
  role!: ROLE.ALUNO;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(trimString)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(normalizeUppercase)
  grr!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(trimString)
  course!: string;
}
