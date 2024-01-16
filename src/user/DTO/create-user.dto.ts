import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../models/user.interface';

export class createUserDto {
  
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(16)
  // @Matches(`^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?/~+-=|\]).*$`)
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsOptional()
  roles: UserRole;
  @IsOptional()
  @IsString()
  profileImage?: string;
}
