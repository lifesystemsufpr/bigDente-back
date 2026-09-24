import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  normalizeEmail,
  trimString,
} from '../../../common/transforms/normalize-string.transform';
import { ROLE } from '../entities/role.enum';

export class UpdateUserDto {
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
  @IsEnum(ROLE)
  role?: ROLE;
}
