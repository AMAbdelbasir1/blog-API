import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class logInDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @MaxLength(16)
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
