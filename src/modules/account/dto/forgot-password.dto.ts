import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';
import { normalizeEmail } from '../../../common/transforms/normalize-string.transform';

export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(normalizeEmail)
  email!: string;
}
