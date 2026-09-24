import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  normalizeEmail,
  trimString,
} from '../../../common/transforms/normalize-string.transform';
import { ROLE } from '../entities/role.enum';

export class CreateUserDto {
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

  @IsEnum(ROLE)
  role!: ROLE;
}
